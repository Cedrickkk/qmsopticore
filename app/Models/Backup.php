<?php

namespace App\Models;

use App\Casts\HumanReadableTime;
use Illuminate\Database\Eloquent\Model;

class Backup extends Model
{
    protected $fillable = [
        'user_id',
        'type',
    ];

    protected $casts = [
        'created_at' => HumanReadableTime::class,
        'updated_at' => HumanReadableTime::class
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
