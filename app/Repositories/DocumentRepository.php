<?php

namespace App\Repositories;

use App\Models\Document;
use App\Models\ArchivedDocument;
use App\Contracts\Repositories\DocumentRepositoryInterface;
use App\Models\DocumentSignatory;
use App\Models\DocumentType;
use App\Models\DocumentWorkflowLog;
use App\Services\FileService;

class DocumentRepository implements DocumentRepositoryInterface
{

    public function __construct(private readonly FileService $fileService) {}

    public function find(int $id)
    {
        return Document::find($id);
    }

    public function create(array $attributes)
    {
        return Document::create($attributes);
    }

    public function update(Document $document, array $data): bool
    {
        return $document->update($data);
    }

    public function delete(Document $document): bool
    {
        return $document->delete();
    }

    public function paginate(?string $search = null)
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

    public function paginateArchived(?string $search = null)
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

    public function archive(Document $document)
    {
        $document->update(['status' => 'archived']);

        ArchivedDocument::create([
            'document_id' => $document->id,
        ]);
    }

    public function unarchive(Document $document)
    {
        $document->update(['status' => 'draft']);

        $document->archivedDocument()->delete();
    }

    public function getHistoryLogs(Document $document)
    {
        return DocumentWorkflowLog::with('user:id,name')
            ->where('document_id', $document->id)
            ->orderBy('updated_at', 'asc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'fromStatus' => $log->from_status,
                    'toStatus' => $log->to_status,
                    'notes' => $log->notes,
                    'createdAt' => $log->created_at,
                    'user' => [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'avatar' => $this->fileService->getUrlPath($log->user->name, 'avatars'),
                    ],
                ];
            });
    }

    public function getDocumentCreationOptions()
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

    public function addSignatory(Document $document, array $data): void
    {
        DocumentSignatory::create([
            'document_id' => $document->id,
            'user_id' => $data['user_id'],
            'signatory_order' => $data['signatory_order'],
            'status' => $data['status'] ?? 'pending',
            'signed_at' => null,
            'comment' => $data['comment'] ?? null
        ]);
    }
}
