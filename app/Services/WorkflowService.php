<?php

namespace App\Services;

use App\Models\User;
use App\Models\Document;
use Illuminate\Support\Facades\DB;
use App\Models\DocumentWorkflowLog;
use App\Contracts\WorkflowServiceInterface;
use App\Contracts\DocumentRepositoryInterface;

class WorkflowService implements WorkflowServiceInterface
{

    public function __construct(private readonly DocumentRepositoryInterface $repository) {}

    public function log(
        Document $document,
        User $user,
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = 'draft',
        ?string $notes = null
    ): DocumentWorkflowLog {
        return DocumentWorkflowLog::create([
            'document_id' => $document->id,
            'user_id' => $user->id,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'notes' => $notes ?? $this->getDefaultNotes($action),
            'created_at' => now(),
        ]);
    }

    public function approve(Document $document, User $user, ?string $comment = null): bool
    {
        $signatory = $document->signatories()
            ->where('user_id', $user->id)
            ->first();

        if (!$this->canApprove($signatory, $document)) {
            return false;
        }

        try {
            DB::beginTransaction();

            $currentStatus = $document->status;

            $this->updateSignatoryStatus($signatory, 'approved', $comment);

            $this->log(
                $document,
                $user,
                'approved',
                $currentStatus,
                $currentStatus,
                $comment ?? 'Document approved'
            );

            if ($this->allSignatoriesApproved($document)) {
                $this->handleFullApproval($document, $user, $currentStatus);
            } else {
                $this->handlePartialApproval($document, $user, $currentStatus);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            return false;
        }
    }

    public function reject(Document $document, User $user, string $reason, ?string $comment = null)
    {
        $signatory = $document->signatories()
            ->where('user_id', $user->id)
            ->first();

        $isSuperAdmin = $user->hasRole('super_admin');

        $nextSignatory = $this->getNextSignatory($document);

        if (!$this->canReject($signatory, $nextSignatory, $isSuperAdmin)) {
            return false;
        }

        $currentStatus = $document->status;

        $document->repository->update(['status' => 'rejected']);

        if ($signatory && $signatory->status === 'pending') {
            $this->updateSignatoryStatus($signatory, 'rejected', $comment);
        }

        $this->log($document, $user, 'rejected', $currentStatus, 'rejected', $reason);

        $this->cancelPendingSignatories($document, $user, $signatory);

        $this->log(
            $document,
            $user,
            'workflow_terminated',
            'rejected',
            'rejected',
            "Document workflow terminated due to rejection: {$reason}"
        );
    }

    private function canApprove($signatory, Document $document): bool
    {
        if (!$signatory || $signatory->status !== 'pending') {
            return false;
        }

        $nextSignatory = $this->getNextSignatory($document);
        return $nextSignatory && $nextSignatory->id === $signatory->id;
    }

    private function canReject($signatory, $nextSignatory, bool $isAdmin): bool
    {
        return $isAdmin || ($signatory && $signatory->status === 'pending' && $signatory->id === $nextSignatory?->id);
    }

    private function getNextSignatory(Document $document)
    {
        return $document->signatories()
            ->where('status', 'pending')
            ->orderBy('signatory_order')
            ->first();
    }

    private function updateSignatoryStatus($signatory, string $status, ?string $comment = null): void
    {
        $signatory->update([
            'status' => $status,
            'signed_at' => now(),
            'comment' => $comment
        ]);
    }

    private function allSignatoriesApproved(Document $document): bool
    {
        return $document->signatories()
            ->where('status', 'pending')
            ->count() === 0;
    }

    private function handleFullApproval(Document $document, User $user, string $currentStatus): void
    {
        $document->repository->update(['status' => 'approved']);

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
        $nextSignatory = $this->getNextSignatory($document);

        if ($nextSignatory) {
            $this->log(
                $document,
                $user,
                'approval_completed',
                $currentStatus,
                $currentStatus,
                "Document ready for next signatory (#{$nextSignatory->signatory_order})"
            );
            // TODO: Feature - notification
            // $this->notifyNextSignatory($nextSignatory);
        }
    }

    public function publish(Document $document, User $user): void
    {
        $document->repository->update(['status' => 'published']);

        $this->log(
            $document,
            $user,
            'published',
            'approved',
            'published',
            'Document published after all approvals received.'
        );
    }

    private function cancelPendingSignatories(Document $document, User $user, $currentSignatory): void
    {
        $pendingSignatories = $document->signatories()
            ->where('status', 'pending')
            ->where('id', '!=', $currentSignatory->id ?? 0)
            ->get();

        foreach ($pendingSignatories as $pendingSignatory) {
            $pendingSignatory->update(['status' => 'canceled']);

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

    private function getDefaultNotes(string $action): ?string
    {
        return match ($action) {
            'created' => 'Document created',
            'signatories_assigned' => 'Signatories assigned to document',
            'approved' => 'Document approved',
            'rejected' => 'Document rejected',
            'published' => 'Document published',
            default => null
        };
    }
}
