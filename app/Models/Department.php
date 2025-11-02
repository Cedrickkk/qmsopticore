<?php

namespace App\Models;

use App\Casts\ReadableDate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Department extends Model
{
    protected $fillable  = [
        'name',
        'code'
    ];

    protected $casts = [
        'created_at' => ReadableDate::class,
        'updated_at' => ReadableDate::class,
    ];

    public function admins()
    {
        return $this->hasMany(User::class, 'department_id')
            ->whereHas('roles', function ($query) {
                $query->where('name', 'department_admin');
            });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function documents()
    {
        return $this->hasManyThrough(
            Document::class,
            User::class,
            'department_id',
            'created_by',
            'id',
            'id'
        );
    }
}
