<?php

namespace App\Repositories;

use App\Models\Document;
use App\Models\ArchivedDocument;
use App\Contracts\Repositories\DocumentRepositoryInterface;
use App\Models\DocumentSignatory;
use App\Models\DocumentType;
use App\Models\DocumentWorkflowLog;
use App\Models\User;
use App\Services\DocumentService;
use App\Services\FileService;
use App\Services\UserService;
use App\Services\WorkflowService;
use Illuminate\Support\Facades\Auth;

class DocumentRepository implements DocumentRepositoryInterface
{

    public function __construct(
        private readonly FileService $fileService,
        private readonly WorkflowService $workflowService
    ) {}

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

    public function paginate(?string $search = null, ?string $dateFrom = null, ?string $dateTo = null)
    {
        $user = User::where('id', Auth::user()->id)->first();
        $isSuperAdmin = $user->hasRole('super_admin');

        $query = Document::query()
            ->where('status', '!=', 'archived')
            ->with(['createdBy:id,name', 'category:id,name'])
            ->latest();

        if ($search) {
            $query->byTitle($search);
        }

        if ($dateFrom || $dateTo) {
            $query->dateRange($dateFrom, $dateTo);
        }

        if (!$isSuperAdmin) {
            $query->where(function ($q) use ($user) {
                $q->forUser($user->id)
                    ->orWhereHas('signatories', function ($signatoryQuery) use ($user) {
                        $signatoryQuery->where('representative_user_id', $user->id)
                            ->where('status', 'pending');
                    });
            });
        }

        return $query->paginate(10)->withQueryString();
    }

    public function paginateArchived(?string $search = null, ?string $dateFrom = null, ?string $dateTo = null)
    {
        $user = User::where('id', Auth::user()->id)->first();
        $isSuperAdmin = $user->hasRole('super_admin');

        $query = ArchivedDocument::query()
            ->active()
            ->with([
                'document.createdBy:id,name',
                'document.category:id,name',
                'archivedBy:id,name'
            ])->latest('archived_at');

        if ($search) {
            $query->byTitle($search);
        }

        if ($dateFrom || $dateTo) {
            $query->dateRange($dateFrom, $dateTo);
        }

        if (!$isSuperAdmin) {
            $query->forUser($user->id);
        }

        return $query->paginate(10)->withQueryString();
    }

    public function archive(Document $document, int $archivedBy, string $reason = 'Manual archive')
    {
        $document->update(['status' => 'archived']);

        ArchivedDocument::create([
            'document_id' => $document->id,
            'archived_by' => $archivedBy,
            'archived_at' => now(),
            'archive_reason' => $reason,
        ]);
    }

    public function unarchive(ArchivedDocument $archivedDocument, int $unarchivedBy)
    {
        $previousStatus = $this->workflowService->getPreviousStatusBeforeArchive($archivedDocument->document_id);

        $archivedDocument->document->update(['status' => $previousStatus]);

        if ($archivedDocument) {
            $archivedByName = $archivedDocument->archivedBy?->name ?? 'Unknown User';
            DocumentWorkflowLog::create([
                'document_id' => $archivedDocument->document_id,
                'user_id' => $unarchivedBy,
                'action' => 'unarchived',
                'from_status' => 'archived',
                'to_status' => $previousStatus,
                'notes' => "Document unarchived. Originally archived by " . $archivedByName . " on " . $archivedDocument->archived_at,
            ]);
            $archivedDocument->delete();
        }

        return $previousStatus;
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
                        'avatar' => null,
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

    public function paginateAuthorizedDocuments(
        User $user,
        ?string $search = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        int $perPage = 10
    ) {
        $query = Document::query()
            ->forUser($user->id)
            ->with([
                'createdBy:id,name,email,avatar',
                'category:id,name',
                'recipients.user:id,name,email,avatar',
                'signatories.user:id,name,email,avatar,position',
                'signatories.representative:id,name,email,position'
            ])
            ->latest();

        if ($search) {
            $query->byTitle($search);
        }

        if ($dateFrom || $dateTo) {
            $query->dateRange($dateFrom, $dateTo);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function addSignatory(Document $document, array $data): void
    {
        DocumentSignatory::create([
            'document_id' => $document->id,
            'user_id' => $data['user_id'],
            'signatory_order' => $data['signatory_order'],
            'status' => $data['status'] ?? 'pending',
            'representative_user_id' => $data['representative_user_id'] ?? null,
            'representative_name' => $data['representative_name'] ?? null,
            'signed_at' => null,
            'comment' => $data['comment'] ?? null,
        ]);
    }

    public function setRepresentative(DocumentSignatory $signatory, User $representative)
    {
        return $signatory->update([
            'representative_user_id' => $representative->id,
            'representative_name' => $representative->name,
        ]);
    }

    public function removeRepresentative(DocumentSignatory $signatory)
    {
        return $signatory->update([
            'representative_user_id' => null,
            'representative_name' => null,
        ]);
    }
}
