<?php

namespace App\Services;

use setasign\Fpdi\Fpdi;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\ArchivedDocument;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;

class DocumentService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function isSignatory(Document $document, $userId): bool
    {
        return $document->signatories()->where('user_id', $userId)->exists();
    }

    public function getDocumentCreationOptions(): array
    {
        $types = DocumentType::with(['categories' => fn($query) => $query->select('id', 'name', 'type')])
            ->select('id', 'name')
            ->get();

        return [
            'types' => $types->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'categories' => $type->categories->map(function ($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name
                        ];
                    })
                ];
            })
        ];
    }

    public function getPaginatedDocuments(?string $search = null): LengthAwarePaginator
    {
        return Document::query()
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->with(['createdBy:id,name', 'category:id,name'])
            ->where('is_archived', false)
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }


    public function getPaginatedArchivedDocuments(?string $search = null)
    {
        return Document::query()
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->with(['createdBy:id,name', 'category:id,name'])
            ->join('archived_documents', 'documents.id', '=', 'archived_documents.document_id')
            ->select('documents.*', 'archived_documents.created_at as archived_at')
            ->whereIn('documents.id', ArchivedDocument::pluck('document_id'))
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function download(Document $document)
    {
        return Storage::download("documents/sample_document.pdf");
    }

    public function documentExists(Document $document): bool
    {
        return Storage::exists("documents/sample_document.pdf");
    }

    public function updateVersion(Document $document, string $version)
    {
        // TODO: Reference to document_title
        $existingPdfPath = Storage::path("documents/many_pages.pdf");

        $pdf = new Fpdi();

        $pageCount = $pdf->setSourceFile($existingPdfPath);

        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            $pdf->AddPage();

            $templateId = $pdf->importPage($pageNo);

            $pdf->useImportedPage($templateId);

            $footerX = 23;
            $footerY = 275;

            $pdf->SetFillColor(255, 255, 255);
            $pdf->Rect($footerX, $footerY - 5, 100, 50, 'F');

            $pdf->SetFont('Helvetica', '', 6);
            $pdf->SetTextColor(128, 128, 128);
            $footerText = "VERSION: " . $version;

            $pdf->SetXY($footerX, $footerY);
            $pdf->Write(0, $footerText);
        }

        $pdf->Output($existingPdfPath, 'F');
    }

    public function archive(Document $document)
    {
        $document->update(['is_archived' => true]);

        ArchivedDocument::create([
            'document_id' => $document->id,
        ]);
    }

    public function unarchive(Document $document)
    {
        $document->update(['is_archived' => false]);

        $document->archivedDocument()->delete();
    }
}
