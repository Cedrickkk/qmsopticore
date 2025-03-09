<?php

namespace App\Services;

use App\Models\Document;

class DocumentService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function isSignatory(Document $document, $userId)
    {
        return $document->signatories()->where('user_id', $userId)->exists();
    }
}
