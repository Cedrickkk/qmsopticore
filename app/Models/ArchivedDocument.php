<?php

namespace App\Models;

use App\Casts\ReadableDate;
use Illuminate\Database\Eloquent\Model;

class ArchivedDocument extends Model
{

    protected $fillable = [
        'document_id',
        'archived_by',
        'archived_at',
        'archive_reason',
    ];

    protected $casts = [
        'created_at' => ReadableDate::class,
        'updated_at' => ReadableDate::class,
        'archived_at' => ReadableDate::class,
    ];

    /**
     * Get the original document
     */
    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the user who archived this document
     */
    public function archivedBy()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    /**
     * Get recipients through the original document
     */
    public function recipients()
    {
        return $this->hasMany(DocumentRecipient::class, 'document_id', 'document_id');
    }

    /**
     * Get signatories through the original document
     */
    public function signatories()
    {
        return $this->hasMany(DocumentSignatory::class, 'document_id', 'document_id');
    }

    /**
     * Search by document title or description
     */
    public function scopeByTitle($query, string $title)
    {
        return $query->whereHas('document', function ($q) use ($title) {
            $q->where('title', 'like', "%{$title}%")
                ->orWhere('description', 'like', "%{$title}%");
        });
    }

    /**
     * Scope to get only active archived documents (not soft-deleted archives)
     */
    public function scopeActive($query)
    {
        return $query->whereNotNull('archived_by');
    }

    /**
     * Scope to get only inactive/soft-deleted archived documents
     */
    public function scopeInactive($query)
    {
        return $query->whereNull('archived_by');
    }

    /**
     * Filter by archive date range
     */
    public function scopeDateRange($query, $from = null, $to = null)
    {
        if ($from) {
            $query->whereDate('archived_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('archived_at', '<=', $to);
        }

        return $query;
    }

    /**
     * Get archives accessible to a specific user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->whereHas('document', function ($q) use ($userId) {
            $q->where('created_by', $userId)
                ->orWhereHas('signatories', function ($sq) use ($userId) {
                    $sq->where('user_id', $userId);
                })
                ->orWhereHas('recipients', function ($rq) use ($userId) {
                    $rq->where('user_id', $userId);
                });
        });
    }

    /**
     * Filter by document creator
     */
    public function scopeByCreator($query, int $userId)
    {
        return $query->whereHas('document', function ($q) use ($userId) {
            $q->where('created_by', $userId);
        });
    }

    /**
     * Filter by document status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->whereHas('document', function ($q) use ($status) {
            $q->where('status', $status);
        });
    }

    /**
     * Filter by document category
     */
    public function scopeByCategory($query, int $categoryId)
    {
        return $query->whereHas('document', function ($q) use ($categoryId) {
            $q->where('category_id', $categoryId);
        });
    }
}
