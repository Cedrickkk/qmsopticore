<?php

namespace App\Models;

use App\Casts\ReadableDate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'filename',
        'created_by',
        'status',
        'category',
        'version',
        'description',
    ];

    protected $casts = [
        'created_at' => ReadableDate::class,
        'updated_at' => ReadableDate::class,
    ];

    /**
     * Get the category of the document.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category');
    }

    /**
     * Get the creator of the document.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the creator of the document.
     */

    public function recipients(): HasMany
    {
        return $this->hasMany(DocumentRecipient::class);
    }

    /**
     * Get the signatories for the document.
     */
    public function signatories(): HasMany
    {
        return $this->hasMany(DocumentSignatory::class, 'document_id', 'id');
    }

    /**
     * Get the workflow logs for the document.
     */
    public function workflowLogs(): HasMany
    {
        return $this->hasMany(DocumentWorkflowLog::class);
    }

    public function archivedDocument()
    {
        return $this->hasOne(ArchivedDocument::class);
    }

    public function scopeByTile($query, string $title)
    {
        return $query->where('description', 'like', "%{$title}%");
    }

    public function scopeDateRange($query, $from = null, $to = null)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('created_by', $userId)
                ->orWhereHas('signatories', function ($sq) use ($userId) {
                    $sq->where('user_id', $userId);
                })
                ->orWhereHas('recipients', function ($rq) use ($userId) {
                    $rq->where('user_id', $userId);
                });
        });
    }

    public function scopeByCreator($query, int $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }
}
