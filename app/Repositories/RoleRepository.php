<?php

namespace App\Repositories;

use App\Contracts\Repositories\RoleRepositoryInterface;
use Spatie\Permission\Models\Role;

class RoleRepository implements RoleRepositoryInterface
{
    public function all()
    {
        return Role::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();
    }
}
