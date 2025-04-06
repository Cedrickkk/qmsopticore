<?php

namespace App\Contracts\Repositories;

interface DepartmentRepositoryInterface
{
    public function all();
    public function findIdByName(string $name);
}
