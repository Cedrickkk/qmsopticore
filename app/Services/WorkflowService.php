<?php

namespace App\Services;

use App\Contracts\Repositories\WorkflowRepositoryInterface;
use App\Models\Document;
use App\Models\DocumentWorkflowLog;
use App\Models\User;

class WorkflowService
{
    public function __construct(
        private readonly WorkflowRepositoryInterface $workflowRepository,
    ) {}

    public function log(
        Document $document,
        User $user,
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = 'draft',
        ?string $notes = null
    ): DocumentWorkflowLog {
        return $this->workflowRepository->log($document, $user, $action, $fromStatus, $toStatus, $notes);
    }

    public function approve(Document $document, User $user, ?string $comment = null): bool
    {
        // Try to get signatory record for the user
        $signatory = $this->workflowRepository->getDocumentSignatory($document, $user);

        // If not found, check if user is a representative
        if (!$signatory) {
            $signatory = $this->workflowRepository->getSignatoryByRepresentative($document, $user);
        }

        if (!$this->canApprove($signatory, $document)) {
            return false;
        }

        $currentStatus = $document->status;

        // Check if signing as representative
        $isRepresentative = $signatory->user_id !== $user->id;

        $this->workflowRepository->approve($document, $user, $comment, $isRepresentative);

        $signerName = $isRepresentative
            ? "{$user->name} (on behalf of {$signatory->user->name})"
            : $user->name;

        $this->log(
            $document,
            $user,
            'approved',
            $currentStatus,
            $currentStatus,
            $comment ?? "Document approved by {$signerName}"
        );

        if ($this->workflowRepository->allSignatoriesApproved($document)) {
            $this->handleFullApproval($document, $user, $currentStatus);
        } else {
            $this->handlePartialApproval($document, $user, $currentStatus);
        }

        return true;
    }

    public function reject(Document $document, User $user, string $reason, ?string $comment = null): bool
    {
        $signatory = $this->workflowRepository->getDocumentSignatory($document, $user);

        // Check if user is a representative
        if (!$signatory) {
            $signatory = $this->workflowRepository->getSignatoryByRepresentative($document, $user);
        }

        $isSuperAdmin = $user->hasRole('super_admin');
        $nextSignatory = $this->workflowRepository->getNextSignatory($document);

        if (!$this->canReject($signatory, $nextSignatory, $isSuperAdmin)) {
            return false;
        }

        $currentStatus = $document->status;

        $isRepresentative = $signatory && $signatory->user_id !== $user->id;

        $this->workflowRepository->reject($document, $user, $reason, $comment, $isRepresentative);

        $signerName = $isRepresentative
            ? "{$user->name} (on behalf of {$signatory->user->name})"
            : $user->name;

        $this->log(
            $document,
            $user,
            'rejected',
            $currentStatus,
            'rejected',
            "Rejected by {$signerName}: {$reason}"
        );

        $this->cancelPendingSignatories($document, $user, $signatory);

        $this->log(
            $document,
            $user,
            'workflow_terminated',
            'rejected',
            'rejected',
            "Document workflow terminated due to rejection: {$reason}"
        );

        return true;
    }

    public function publish(Document $document, User $user): bool
    {
        $success = $this->workflowRepository->publish($document, $user);

        if ($success) {
            $this->log(
                $document,
                $user,
                'published',
                'approved',
                'published',
                'Document published after all approvals received.'
            );
        }

        return $success;
    }

    private function canApprove($signatory, Document $document): bool
    {
        if (!$signatory || $signatory->status !== 'pending') {
            return false;
        }

        $nextSignatory = $this->workflowRepository->getNextSignatory($document);

        return $nextSignatory && $nextSignatory->id === $signatory->id;
    }

    private function canReject($signatory, $nextSignatory, bool $isAdmin): bool
    {
        return $isAdmin || ($signatory && $signatory->status === 'pending' && $signatory->id === $nextSignatory?->id);
    }

    private function handleFullApproval(Document $document, User $user, string $currentStatus): void
    {
        $this->workflowRepository->updateDocumentStatus($document, 'approved');

        $this->log(
            $document,
            $user,
            'status_changed',
            $currentStatus,
            'approved',
            'All signatories have approved the document'
        );

        $this->publish($document, $user);
    }

    private function handlePartialApproval(Document $document, User $user, string $currentStatus): void
    {
        $nextSignatory = $this->workflowRepository->getNextSignatory($document);

        if ($nextSignatory) {
            $this->log(
                $document,
                $user,
                'approval_completed',
                $currentStatus,
                $currentStatus,
                "Document ready for next signatory (#{$nextSignatory->signatory_order})"
            );
        }
    }

    private function cancelPendingSignatories(Document $document, User $user, $currentSignatory): void
    {
        $pendingSignatories = $this->workflowRepository->getPendingSignatories(
            $document,
            $currentSignatory->id ?? 0
        );

        $this->workflowRepository->cancelPendingSignatories($document, $currentSignatory->id ?? 0);

        foreach ($pendingSignatories as $pendingSignatory) {
            $this->log(
                $document,
                $user,
                'signatory_canceled',
                'rejected',
                'rejected',
                "Signatory #{$pendingSignatory->signatory_order} approval canceled due to document rejection"
            );
        }
    }

    public function getPreviousStatusBeforeArchive($documentId): string
    {
        $archiveLog = DocumentWorkflowLog::where('document_id', $documentId)
            ->where('action', 'archived')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($archiveLog && $archiveLog->from_status) {
            return $archiveLog->from_status;
        }

        $previousLog = DocumentWorkflowLog::where('document_id', $documentId)
            ->where('action', '!=', 'archived')
            ->whereNotNull('to_status')
            ->orderBy('created_at', 'desc')
            ->first();

        return $previousLog ? $previousLog->to_status : 'draft';
    }
}
