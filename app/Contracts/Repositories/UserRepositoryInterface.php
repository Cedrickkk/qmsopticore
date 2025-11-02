<?php

namespace App\Contracts\Repositories;


interface UserRepositoryInterface
{
    public function create(array $attributes);
    public function findByEmail(string $email);
    public function paginate(?string $search = null, ?int $departmentId = null);
    public function getUserCreationOptions();

    public function findByEmailWithDepartment(string $email);
}
