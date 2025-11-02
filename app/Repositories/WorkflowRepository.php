<?php

namespace App\Repositories;

use App\Contracts\Repositories\WorkflowRepositoryInterface;
use App\Models\Document;
use App\Models\DocumentWorkflowLog;
use App\Models\User;

class WorkflowRepository implements WorkflowRepositoryInterface
{
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


    public function approve(Document $document, User $user, ?string $comment = null, bool $isRepresentative = false): void
    {
        $signatory = $this->getDocumentSignatory($document, $user);

        if (!$signatory) {
            $signatory = $this->getSignatoryByRepresentative($document, $user);
        }

        if ($signatory) {
            $updateData = [
                'status' => 'approved',
                'signed_at' => now(),
                'comment' => $comment,
            ];

            if ($isRepresentative) {
                $updateData['signed_by_representative'] = true;
                $updateData['representative_signed_at'] = now();
            }

            $signatory->update($updateData);
        }
    }


    public function reject(Document $document, User $user, string $reason, ?string $comment = null, bool $isRepresentative = false): void
    {
        $signatory = $this->getDocumentSignatory($document, $user);

        if (!$signatory) {
            $signatory = $this->getSignatoryByRepresentative($document, $user);
        }

        if ($signatory) {
            $updateData = [
                'status' => 'rejected',
                'signed_at' => now(),
                'comment' => $comment ?? $reason,
            ];

            if ($isRepresentative) {
                $updateData['signed_by_representative'] = true;
            }

            $signatory->update($updateData);
        }

        $document->update(['status' => 'rejected']);
    }

    public function publish(Document $document, User $user): bool
    {
        return $document->update(['status' => 'published']);
    }

    public function updateDocumentStatus(Document $document, string $status): bool
    {
        return $document->update(['status' => $status]);
    }

    public function getSignatoryByRepresentative(Document $document, User $user)
    {
        return $document->signatories()
            ->where('representative_user_id', $user->id)
            ->where('status', operator: 'pending')
            ->first();
    }

    public function getDocumentSignatory(Document $document, User $user)
    {
        return $document->signatories()
            ->where('user_id', $user->id)
            ->first();
    }

    public function getNextSignatory(Document $document)
    {
        $nextSignatory = $document->signatories()
            ->where('status', 'pending')
            ->orderBy('signatory_order', 'asc')
            ->with(['user', 'representative'])
            ->first();


        return $nextSignatory;
    }

    public function updateSignatoryStatus($signatory, string $status, ?string $comment = null): bool
    {
        return $signatory->update([
            'status' => $status,
            'signed_at' => now(),
            'comment' => $comment,
        ]);
    }

    public function allSignatoriesApproved(Document $document): bool
    {
        return $document->signatories()
            ->where('status', 'pending')
            ->count() === 0;
    }

    public function cancelPendingSignatories(Document $document, $excludeSignatoryId = null): int
    {
        $query = $document->signatories()->where('status', 'pending');

        if ($excludeSignatoryId) {
            $query->where('id', '!=', $excludeSignatoryId);
        }

        return $query->update(['status' => 'rejected']);
    }

    public function getPendingSignatories(Document $document, $excludeSignatoryId = null)
    {
        $query = $document->signatories()->where('status', 'pending');

        if ($excludeSignatoryId) {
            $query->where('id', '!=', $excludeSignatoryId);
        }

        return $query->get();
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
