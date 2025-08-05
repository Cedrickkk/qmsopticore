<?php

namespace App\Services;

use App\Contracts\Repositories\DocumentRepositoryInterface;
use App\Enums\DepartmentEnum;
use App\Enums\DocumentStatusEnum;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentAccessRequest;
use App\Models\Document;
use App\Models\DocumentRecipient;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class DocumentService
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly PdfService $pdfService,
        private readonly FileService $fileService,
        private readonly WorkflowService $workflowService,
        private readonly DocumentRepositoryInterface $documentRepository,
        private readonly UserService $userService,
    ) {}

    public function store(StoreDocumentRequest $request): Document
    {
        Gate::authorize('create', Document::class);

        $data = $request->validated();

        $user = $this->userService->getUser();

        $file = $data['file'];

        $filename = $this->fileService->generateUniqueFilename($file);

        $document = $this->documentRepository->create([
            'code' => $this->generateDocumentCode($data['type']['id']),
            'title' => $file->getClientOriginalName(),
            'filename' => $filename,
            'description' => $data['description'],
            'created_by' => $user->id,
            'status' => DocumentStatusEnum::DRAFT->value,
            'category' => $data['category']['id'],
            'version' => '1.0.0',
        ]);

        $this->fileService->upload($file, 'documents', $filename);

        $this->workflowService->log(
            $document,
            $user,
            'created',
            null,
            'draft',
            'Document created'
        );

        if (! empty($data['users'])) {
            $users = collect($data['users']);

            $this->handleSignatories($document, collect($data['users']), $user);

            $this->handleRecipients($users, $document);
        }

        return $document;
    }

    public function approve(Document $document, ?string $comment = null)
    {
        $this->workflowService->approve($document, $this->userService->getUser(), $comment);
    }

    public function reject(Document $document, string $reason, ?string $comment = null)
    {
        $this->workflowService->reject($document, $this->userService->getUser(), $reason, $comment);
    }

    public function download(string $filename)
    {
        return $this->fileService->download($filename);
    }

    public function exists(string $filename)
    {
        return $this->fileService->exists($filename);
    }

    public function updateVersion(Document $document, string $version)
    {
        $this->pdfService->updateVersion($document, $version);
    }

    public function archive(Document $document)
    {
        $this->documentRepository->archive($document);
    }

    public function unarchive(Document $document)
    {
        $this->documentRepository->unarchive($document);
    }

    public function getPaginatedDocuments(?string $search = null, ?string $dateFrom = null, ?string $dateTo = null): LengthAwarePaginator
    {
        return $this->documentRepository->paginate($search, $dateFrom, $dateTo);
    }

    public function getPaginatedArchivedDocuments(?string $search = null)
    {
        return $this->documentRepository->paginateArchived($search);
    }

    public function getDocumentCreationOptions(): array
    {
        return $this->documentRepository->getDocumentCreationOptions();
    }

    public function getDocumentHistoryLogs(Document $document)
    {
        return $this->documentRepository->getHistoryLogs($document);
    }

    // TODO: Extract this into signatory service class or interface
    public function handleSignatories(Document $document, Collection $users, User $creator)
    {
        $signatories = $users->filter(fn($user) => $user['signatory'] === '1')->values()->map(function ($user, $index) {
            $user['signatory_order'] = $index + 1;

            return $user;
        });

        if ($signatories->isEmpty()) {
            return;
        }

        $signatories->each(function ($signatory) use ($document, $creator) {
            $this->documentRepository->addSignatory($document, [
                'user_id' => $signatory['id'],
                'signatory_order' => $signatory['signatory_order'],
                'status' => 'pending',
            ]);

            $this->workflowService->log(
                $document,
                $creator,
                'signatory_added',
                'draft',
                'draft',
                "Added signatory #{$signatory['signatory_order']}"
            );

            $document->update(['status' => 'in_review']);

            $this->workflowService->log(
                $document,
                $creator,
                'status_changed',
                'draft',
                'in_review',
                'Document sent for review'
            );
        });
    }

    public function isSignatory(Document $document, string $userId): bool
    {
        return $document->signatories()->where('user_id', $userId)->exists();
    }

    public function handleRecipients(Collection $users, Document $document)
    {
        $recipients = $users->reject(fn($user) => $user['signatory'] == '1')->values();

        $recipients->each(function ($recipient) use ($document) {
            DocumentRecipient::create([
                'document_id' => $document->id,
                'user_id' => $recipient['id'],
            ]);

            $recipientName = $recipient['name'] ?? 'User';

            $this->workflowService->log(
                $document,
                $this->userService->getUser(),
                'recipient_added',
                $document->status,
                $document->status,
                "Added {$recipientName} as document recipient"
            );
        });
    }

    public function getPaginatedAuthorizedDocuments(
        User $user,
        ?string $search = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
        int $perPage = 10
    ): LengthAwarePaginator {
        $paginatedDocuments = $this->documentRepository->paginateAuthorizedDocuments(
            $user,
            $search,
            $dateFrom,
            $dateTo,
            $perPage
        );

        $paginatedDocuments->getCollection()->transform(function ($document) use ($user) {
            $association = $this->determineUserAssociation($document, $user);
            $document->user_association = $association;
            return $document;
        });

        return $paginatedDocuments;
    }


    public function getAuthorizedDocuments(User $user): Collection
    {
        return Document::where(function ($query) use ($user) {
            $query->where('created_by', $user->id)
                ->orWhereHas('recipients', function ($subQuery) use ($user) {
                    $subQuery->where('user_id', $user->id);
                })
                ->orWhereHas('signatories', function ($subQuery) use ($user) {
                    $subQuery->where('user_id', $user->id);
                });
        })
            ->with([
                'createdBy:id,name,email,avatar',
                'category:id,name',
                'recipients.user:id,name,email,avatar',
                'signatories.user:id,name,email,avatar,position'
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($document) use ($user) {
                $association = $this->determineUserAssociation($document, $user);
                $document->user_association = $association;
                return $document;
            });;
    }


    private function determineUserAssociation(Document $document, User $user): string
    {
        if ($document->created_by === $user->id) {
            return 'Creator';
        }

        $signatory = $document->signatories->where('user_id', $user->id)->first();
        if ($signatory) {
            return "Signatory";
        }

        $recipient = $document->recipients->where('user_id', $user->id)->first();
        if ($recipient) {
            return 'Recipient';
        }

        return 'Unknown';
    }

    private function generateDocumentCode($documentTypeId = null): string
    {
        $user = $this->userService->getUser();

        $department = $user->department;

        if ($department) {
            foreach (DepartmentEnum::cases() as $deptEnum) {
                if (strtolower($deptEnum->label()) === strtolower($department->name)) {
                    $departmentCode = $deptEnum->value;
                    break;
                }
            }
        }

        $year = now()->format('Y');

        $documentCode = DocumentType::find($documentTypeId)->code;

        $sequence = $this->getNextSequenceNumber($departmentCode, $year, $documentCode);

        return sprintf(
            '%s-%s-%s-%04d',
            $departmentCode,
            $year,
            $documentCode,
            $sequence
        );
    }

    private function getNextSequenceNumber(string $departmentCode, string $year, string $docType): int
    {
        $pattern = "{$departmentCode}-{$year}-{$docType}-%";

        $lastDocument = Document::where('code', 'like', $pattern)
            ->orderByRaw('CAST(SUBSTRING_INDEX(code, "-", -1) AS UNSIGNED) DESC')
            ->first();

        if (! $lastDocument) {
            return 1;
        }

        $parts = explode('-', $lastDocument->code);
        $lastSequence = (int) end($parts);

        return $lastSequence + 1;
    }
}
