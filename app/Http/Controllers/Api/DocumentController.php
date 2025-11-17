<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\ActivityLogService;
use App\Services\DocumentService;
use App\Services\FileService;
use App\Services\PdfEncryptionService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class DocumentController extends Controller
{
    public function __construct(
        protected readonly DocumentService $documentService,
        private readonly ActivityLogService $activityLogService,
        private readonly FileService $fileService,
        private readonly UserService $userService,
        private readonly PdfEncryptionService $pdfEncryptionService,
    ) {}

    // public function download(Document $document, Request $request)
    // {
    //     $filename = $document->filename;
    //     if (!$this->documentService->exists($filename)) {
    //         return response()->json([
    //             'error' => 'Document file not found.',
    //         ], 404);
    //     }

    //     if ($document->isConfidential()) {
    //         $request->validate([
    //             'password' => 'required|string',
    //         ]);

    //         $userPassword = $request->input('password');

    //         if (!Hash::check($userPassword, $this->userService->getUser()->password)) {
    //             return response()->json([
    //                 'error' => 'Invalid password.',
    //             ], 401);
    //         }

    //         $zip = new ZipArchive();
    //         $zipFileName = pathinfo($filename, PATHINFO_FILENAME) . '_' . now()->format('YmdHis') . '.zip';
    //         $zipPath = storage_path('app/temp/' . $zipFileName);

    //         if (!file_exists(storage_path('app/temp'))) {
    //             mkdir(storage_path('app/temp'), 0755, true);
    //         }

    //         if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
    //             $filePath = $this->fileService->getPath($filename);

    //             if (!file_exists($filePath)) {
    //                 return response()->json([
    //                     'error' => 'Document file not found on disk.',
    //                 ], 404);
    //             }

    //             $addResult = $zip->addFile($filePath, $filename);

    //             if (!$addResult) {
    //                 Log::error("Failed to add file to ZIP: {$filePath}");
    //                 $zip->close();
    //                 return response()->json([
    //                     'error' => 'Failed to create archive.',
    //                 ], 500);
    //             }

    //             $passwordResult = $zip->setPassword($userPassword);

    //             if (!$passwordResult) {
    //                 Log::error("Failed to set ZIP password");
    //             }

    //             $encryptResult = $zip->setEncryptionName($filename, ZipArchive::EM_AES_256);

    //             if (!$encryptResult) {
    //                 Log::error("Failed to set encryption for: {$filename}");
    //             }

    //             $readmeContent = "CONFIDENTIAL DOCUMENT\n\n";
    //             $readmeContent .= "This ZIP contains a password-protected file.\n";
    //             $readmeContent .= "Use your account password to extract the document.\n\n";
    //             $readmeContent .= "Document: {$document->code}\n";
    //             $readmeContent .= "Downloaded by: " . $this->userService->getUser()->name . "\n";
    //             $readmeContent .= "Downloaded at: " . now()->format('Y-m-d H:i:s') . "\n\n";
    //             $readmeContent .= "Protected file: {$filename}\n";

    //             $zip->addFromString('README.txt', $readmeContent);

    //             // Close the ZIP
    //             $closeResult = $zip->close();

    //             if (!$closeResult) {
    //                 Log::error("Failed to close ZIP file");
    //                 return response()->json([
    //                     'error' => 'Failed to finalize archive.',
    //                 ], 500);
    //             }

    //             if (!file_exists($zipPath)) {
    //                 return response()->json([
    //                     'error' => 'Archive file not created.',
    //                 ], 500);
    //             }

    //             Log::info("Created password-protected ZIP: {$zipPath}");
    //         } else {
    //             return response()->json([
    //                 'error' => 'Failed to create archive.',
    //             ], 500);
    //         }

    //         $this->activityLogService->logDocument(
    //             action: 'downloaded',
    //             document: $document,
    //         );

    //         return response()->download($zipPath, $zipFileName)
    //             ->deleteFileAfterSend(true);
    //     }

    //     $this->activityLogService->logDocument(
    //         action: 'downloaded',
    //         document: $document,
    //     );

    //     return $this->documentService->download($filename);
    // }


    public function download(Document $document, Request $request)
    {
        $filename = $document->filename;
        if (!$this->documentService->exists($filename)) {
            return response()->json(['error' => 'Document file not found.'], 404);
        }

        if ($document->isConfidential()) {
            $request->validate(['password' => 'required|string']);
            $userPassword = $request->input('password');

            if (!Hash::check($userPassword, $this->userService->getUser()->password)) {
                return response()->json(['error' => 'Invalid password.'], 401);
            }

            $sourcePath = $this->fileService->getPath($filename);
            $encryptedPath = storage_path('app/temp/encrypted_' . $filename);



            if (!$this->pdfEncryptionService->encryptPdf($sourcePath, $encryptedPath, $userPassword)) {
                return response()->json(['error' => 'Failed to encrypt document.'], 500);
            }

            $this->activityLogService->logDocument('downloaded', $document);

            return response()->download($encryptedPath, $filename)->deleteFileAfterSend(true);
        }

        $this->activityLogService->logDocument('downloaded', $document);
        return $this->documentService->download($filename);
    }

    public function bulkDownload(Request $request)
    {
        $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id'
        ]);

        $documents = Document::whereIn('id', $request->document_ids)->get();
        $hasConfidential = $documents->contains('confidentiality', 'confidential');

        if ($hasConfidential) {
            $request->validate([
                'password' => 'required|string',
            ]);

            $userPassword = $request->input('password');

            if (!Hash::check($userPassword, $this->userService->getUser()->password)) {
                return response()->json([
                    'error' => 'Invalid password.',
                ], 401);
            }
        }

        $zip = new ZipArchive();
        $zipFileName = 'documents_' . now()->format('Y-m-d_His') . '.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);

        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {

            if ($hasConfidential) {
                $zip->setPassword($request->input('password'));
            }

            foreach ($documents as $document) {
                if ($this->fileService->exists($document->filename)) {
                    $filePath = $this->fileService->getPath($document->filename);
                    $fileNameInZip = $document->code . '_' . $document->filename;

                    $zip->addFile($filePath, $fileNameInZip);

                    if ($document->isConfidential() && $hasConfidential) {
                        $zip->setEncryptionName(
                            $fileNameInZip,
                            ZipArchive::EM_AES_256
                        );
                    }
                }
            }

            if ($hasConfidential) {
                $readmeContent = "PASSWORD PROTECTED FILES\n\n";
                $readmeContent .= "This archive contains confidential documents.\n";
                $readmeContent .= "Confidential files are encrypted with your account password.\n\n";
                $readmeContent .= "Downloaded by: " . $this->userService->getUser()->name . "\n";
                $readmeContent .= "Downloaded at: " . now()->format('Y-m-d H:i:s') . "\n\n";
                $readmeContent .= "Confidential documents (password-protected):\n";

                foreach ($documents->where('confidentiality', 'confidential') as $doc) {
                    $readmeContent .= "- {$doc->code}_{$doc->filename}\n";
                }

                $zip->addFromString('README.txt', $readmeContent);
            }

            $zip->close();
        }

        foreach ($documents as $document) {
            $this->activityLogService->logDocument('downloaded', $document);
        }

        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }
}
