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
        'creator',
        'status',
        'category',
        'version',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(DocumentRecipient::class);
    }

    public function signatories(): HasMany
    {
        return $this->hasMany(DocumentSignatory::class);
    }
}
