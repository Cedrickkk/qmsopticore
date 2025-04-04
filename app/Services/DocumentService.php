<?php

namespace App\Services;

use App\Enums\DocumentStatusEnum;
use setasign\Fpdi\Fpdi;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\ArchivedDocument;
use App\Models\DocumentWorkflowLog;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\DocumentRecipient;
use App\Models\DocumentSignatory;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

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

    public function getDocumentHistoryLogs(Document $document)
    {
        return DocumentWorkflowLog::with('user:id,name')
            ->where('document_id', $document->id)
            ->latest()
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'fromStatus' => $log->from_status,
                    'toStatus' => $log->to_status,
                    'notes' => $log->notes,
                    'createdAt' => $log->created_at->toISOString(),
                    'user' => [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'avatar' => null,
                    ],
                ];
            });
    }


    public function store(StoreDocumentRequest $request)
    {
        $user = Auth::user();
        $users = collect($request->input('users', []));

        $document = $this->createDocument(
            $this->handleFileUpload($request->file('file')),
            $request->input('description'),
            $request->input('category'),
            $user
        );

        $this->createWorkflowLog(
            $document,
            $user,
            'created',
            null,
            'draft',
            'Document created'
        );

        $signatories = $users->filter(fn($user) => $user['signatory'] === '1')
            ->values();

        if ($signatories->isNotEmpty()) {
            $signatories->each(function ($signatory, $index) use ($document, $user) {
                $docSignatory = DocumentSignatory::create([
                    'document_id' => $document->id,
                    'user_id' => $signatory['id'],
                    'signatory_order' => $index + 1,
                    'status' => 'pending'
                ]);

                $this->createWorkflowLog(
                    $document,
                    $user,
                    'signatory_added',
                    'draft',
                    'draft',
                    "Added {$signatory['name']} as signatory #{$docSignatory->signatory_order}"
                );
            });

            $document->update(['status' => 'in_review']);

            $this->createWorkflowLog(
                $document,
                $user,
                'status_changed',
                'draft',
                'in_review',
                'Document sent for review'
            );
        }
    }


    public function handleFileUpload($file)
    {
        $documentName = $file->getClientOriginalName();

        Storage::putFileAs('documents', $file, $documentName);

        return $documentName;
    }


    public function handleRecipients($users, $document)
    {
        $users->each(function ($recipient) use ($document) {
            DocumentRecipient::create([
                'document_id' => $document->id,
                'user_id' => $recipient['id'],
            ]);
        });
    }

    public function handleSignatories($signatories, $document)
    {
        $signatories->each(function ($signatory) use ($document) {
            DocumentSignatory::create([
                'document_id' => $document->id,
                'user_id' => $signatory['id'],
                'signatory_order' => $signatory['signatory_order'],
                'status' => 'pending',
            ]);
        });
    }

    public function createDocument(
        string $title,
        string $description,
        array $category,
        User $user
    ): Document {
        return Document::create([
            'code' => $this->generateDocumentCode(),
            'title' => $title,
            'description' => $description,
            'created_by' => $user->id,
            'status' => DocumentStatusEnum::DRAFT->value,
            'category' => $category['id'],
            'version' => '1.0.0',
        ]);
    }

    private function generateDocumentCode(): string
    {
        $prefix = 'DOC';
        $timestamp = now()->format('Ymd');
        $random = strtoupper(Str::random(4));

        return "{$prefix}-{$timestamp}-{$random}";
    }

    private function createWorkflowLog(
        Document $document,
        User $user,
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = 'draft',
        ?string $notes = null
    ): void {
        DocumentWorkflowLog::create([
            'document_id' => $document->id,
            'user_id' => $user->id,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'notes' => $notes ?? match ($action) {
                'created' => 'Document created',
                'signatories_assigned' => 'Signatories assigned to document',
                default => null
            },
            'created_at' => now(),
        ]);
    }
}
