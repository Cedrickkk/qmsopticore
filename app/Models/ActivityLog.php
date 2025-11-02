<?php

namespace App\Models;

use App\Casts\HumanReadableTime;
use App\Casts\ReadableDate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


/**
 * ! Prefer to use `laravel-activitylog` package than creating new activity_log table
 * 
 * TODO: Change the old and new values column in the database
 *  
 */
class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => ReadableDate::class,
        'updated_at' => ReadableDate::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function entity()
    {
        if ($this->entity_type && $this->entity_id) {
            $modelClass = "App\\Models\\{$this->entity_type}";
            if (class_exists($modelClass)) {
                return $modelClass::find($this->entity_id);
            }
        }

        return null;
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByEntityType($query, string $entityType)
    {
        return $query->where('entity_type', $entityType);
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
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
}
