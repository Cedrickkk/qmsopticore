<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\ActivityLogService;
use App\Services\DocumentService;
use App\Services\FileService;
use Illuminate\Http\Request;
use ZipArchive;

/**
 * TODO: This is unnecessary just use DocumentService
 */


class DocumentController extends Controller
{
    public function __construct(
        protected readonly DocumentService $documentService,
        private readonly ActivityLogService $activityLogService,
        private readonly FileService $fileService,
    ) {}

    public function download(Document $document)
    {
        $filename = $document->filename;
        if (! $this->documentService->exists($filename)) {
            return response()->json([
                'error' => 'Document file not found.',
            ], 404);
        }

        $this->activityLogService->logDocument(
            action: 'downloaded',
            document: $document,
        );

        return $this->documentService->download($filename);
    }

    public function bulkDownload(Request $request)
    {
        $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id'
        ]);

        $documents = Document::whereIn('id', $request->document_ids)->get();

        $zip = new ZipArchive();
        $zipFileName = 'documents_' . now()->format('Y-m-d_His') . '.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);

        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        if ($zip->open($zipPath, ZipArchive::CREATE) === true) {
            foreach ($documents as $document) {
                if ($this->fileService->exists($document->filename)) {
                    $filePath = $this->fileService->getPath($document->filename);
                    $zip->addFile($filePath, $document->code . '_' . $document->filename);
                }
            }
            $zip->close();
        }

        foreach ($documents as $document) {
            $this->activityLogService->logDocument('downloaded', $document);
        }

        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }
}
