<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use App\Repositories\WorkflowRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class DocumentViewService
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly FileService $fileService,
        private readonly WorkflowRepository $workflowRepository,
        private readonly UserService $userService,
        private readonly DocumentAccessPermissionService $accessPermissionService,
    ) {}

    public function prepareDocumentForView(Document $document, User $user)
    {
        Gate::authorize('view', $document);

        $document->load([
            'createdBy:id,name',
            'category:id,name',
            'signatories' => function ($query) {
                $query->orderBy('signatory_order', 'asc')
                    ->select('id', 'document_id', 'user_id', 'status', 'signed_at', 'signatory_order', 'representative_user_id', 'representative_name', 'comment');
            },
            'recipients' => function ($query) {
                $query->orderBy('created_at', 'asc')
                    ->select('id', 'document_id', 'user_id');
            },
            'signatories.user:id,name,position,avatar',
            'signatories.representative:id,name,position,avatar',
            'recipients.user:id,name,position,avatar',
        ]);

        $document->signatories->each(function ($signatory) {
            $signatory->user->avatar = $this->fileService->getUrlPath($signatory->user->avatar ?? '', 'avatars');
            if ($signatory->representative) {
                $signatory->representative->avatar = $this->fileService->getUrlPath($signatory->representative->avatar ?? '', 'avatars');
            }
        });

        $document->recipients->each(fn($recipient) => $recipient->user->avatar = $this->fileService->getUrlPath($recipient->user->avatar ?? '', 'avatars'));

        $nextSignatory = $this->workflowRepository->getNextSignatory($document);

        $isCurrentSignatory = $nextSignatory && (
            $nextSignatory->user_id === $user->id ||
            $nextSignatory->representative_user_id === $user->id
        );

        $canSign = $isCurrentSignatory && $document->status !== 'rejected' && $document->status !== 'archived';

        $signatures = null;
        if ($isCurrentSignatory) {
            if ($nextSignatory->representative_user_id === $user->id) {
                $signatures = $this->userService->getSignatures($user);
            } else {
                $signatures = $this->userService->getSignatures($user);
            }
        }

        $accessPermissions = $this->accessPermissionService->getUserPermissionsSummary($document, $user);

        return [
            'document' => $document,
            'file' => $this->fileService->getUrlPath($document->filename ?? '', 'documents'),
            'canSign' => $canSign,
            'signatures' => $signatures,
            'nextSignatory' => $nextSignatory ? [
                'id' => $nextSignatory->user->id,
                'order' => $nextSignatory->signatory_order,
                'name' => $nextSignatory->user->name,
                'representative_user_id' => $nextSignatory->representative_user_id,
                'representative_name' => $nextSignatory->representative_name,
            ] : null,
            'accessPermissions' => $accessPermissions,
            'confidentiality_level' => $document->confidentiality_level,
            'require_reauth_on_view' => $document->requiresReauth(),
            'auto_blur_after_seconds' => $document->getAutoBlurSeconds(),
        ];
    }
}
