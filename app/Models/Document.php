<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Document extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'title',
        'created_by',
        'status',
        'category',
        'version',
        'description'
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

    public function recipients(): HasMany
    {
        return $this->hasMany(DocumentRecipient::class);
    }

    /**
     * Get the signatories for the document.
     */
    public function signatories(): HasMany
    {
        return $this->hasMany(DocumentSignatory::class);
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
}
