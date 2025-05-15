<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class DocumentViewService
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly FileService $fileService,
        private readonly WorkflowService $workflowService,
    ) {}

    public function prepareDocumentForView(Document $document, User $user)
    {
        Gate::authorize('view', $document);

        $signatures = $user->getSignatures();

        $document->load([
            'createdBy:id,name',
            'category:id,name',
            'signatories' => function ($query) {
                $query->orderBy('signatory_order', 'asc')
                    ->select('id', 'document_id', 'user_id', 'status', 'signed_at', 'signatory_order');
            },
            'signatories.user:id,name,position,avatar'
        ]);

        $document->signatories->each(fn($signatory) => $signatory->user->avatar = $this->fileService->getUrlPath($signatory->user->avatar ?? "", 'avatars'));

        $nextSignatory = $this->workflowService->getNextSignatory($document);

        $isCurrentSignatory = $nextSignatory && $nextSignatory->user_id === $user->id;

        return [
            'document' => $document,
            'file' => $this->fileService->getUrlPath($document->filename ?? "", 'documents'),
            'canSign' => $isCurrentSignatory && $this->documentService->isSignatory($document, $user->id),
            'signatures' => $isCurrentSignatory ? $signatures : null,
            'isNextSignatory' => $nextSignatory ? [
                'order' => $nextSignatory->signatory_order,
                'name' => $nextSignatory->user->name
            ] : null
        ];
    }
}
