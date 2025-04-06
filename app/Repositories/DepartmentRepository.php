<?php

namespace App\Repositories;

use App\Models\Department;
use App\Contracts\Repositories\DepartmentRepositoryInterface;

class DepartmentRepository implements DepartmentRepositoryInterface
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function all()
    {
        return Department::select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    public function findIdByName(string $name)
    {
        return Department::where('name', $name)->value('id');
    }
}
