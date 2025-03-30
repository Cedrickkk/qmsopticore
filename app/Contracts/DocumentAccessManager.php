<?php

namespace App\Contracts;

use App\Models\User;
use App\Models\Document;

interface DocumentAccessManager
{
    public function canCreate(User $user): bool;
    public function canView(User $user, Document $document): bool;
    public function canEdit(User $user, Document $document): bool;
    public function canDownload(User $user, Document $document): bool;
    public function canRevoke(User $user, Document $document, User $targetUser): bool;
    public function canSign(User $user, Document $document): bool;
    public function canReject(User $user, Document $document): bool;
}
