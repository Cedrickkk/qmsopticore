<?php

namespace App\Models;

use App\Casts\HumanReadableTime;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DocumentSignatory extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'user_id',
        'signatory_order',
        'status',
        'comment',
        'signed_at',
        'representative_user_id',
        'representative_name',
        'signed_by_representative',
        'representative_signed_at',
    ];

    protected $casts = [
        'signed_at' => HumanReadableTime::class,
        'representative_signed_at' => HumanReadableTime::class,
        'signed_by_representative' => 'boolean',
    ];

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class);
    }

    public function representative()
    {
        return $this->belongsTo(User::class, 'representative_user_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
