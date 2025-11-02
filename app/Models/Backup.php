<?php

namespace App\Models;

use App\Casts\HumanReadableTime;
use Illuminate\Database\Eloquent\Model;

class Backup extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'filename',
        'path',
        'size',
        'successful',
        'error_message',
    ];

    protected $casts = [
        'successful' => 'boolean',
        'size' => 'integer',
        'created_at' => HumanReadableTime::class,
        'updated_at' => HumanReadableTime::class
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFileSizeAttribute(): string
    {
        if (!$this->size) {
            return 'Unknown';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->size;
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
