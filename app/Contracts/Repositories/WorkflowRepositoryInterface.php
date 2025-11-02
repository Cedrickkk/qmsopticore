<?php

namespace App\Contracts\Repositories;

use App\Models\Document;
use App\Models\DocumentWorkflowLog;
use App\Models\User;

interface WorkflowRepositoryInterface
{
    public function log(
        Document $document,
        User $user,
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = 'draft',
        ?string $notes = null
    ): DocumentWorkflowLog;

    public function getSignatoryByRepresentative(Document $document, User $user);

    public function approve(Document $document, User $user, ?string $comment = null, bool $isRepresentative = false): void;

    public function reject(Document $document, User $user, string $reason, ?string $comment = null, bool $isRepresentative = false): void;

    public function publish(Document $document, User $user): bool;

    public function updateDocumentStatus(Document $document, string $status): bool;

    public function getDocumentSignatory(Document $document, User $user);

    public function getNextSignatory(Document $document);

    public function updateSignatoryStatus($signatory, string $status, ?string $comment = null): bool;

    public function allSignatoriesApproved(Document $document): bool;

    public function cancelPendingSignatories(Document $document, $excludeSignatoryId = null): int;

    public function getPendingSignatories(Document $document, $excludeSignatoryId = null);
}
