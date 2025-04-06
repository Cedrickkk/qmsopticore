<?php

namespace App\Contracts\Services;

use App\Models\User;
use App\Models\Document;

interface WorkflowServiceInterface
{
    public function log(
        Document $document,
        User $user,
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = 'draft',
        ?string $notes = null
    );
    public function approve(Document $document, User $user, ?string $comment = null);
    public function reject(Document  $document, User $user, string $reason, ?string $comment = null);
    public function publish(Document $document, User $user);
}
