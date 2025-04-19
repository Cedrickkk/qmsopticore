<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Department extends Model
{
    protected $fillable  = [
        'name',
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
}
