<?php

namespace App\Contracts\Repositories;


interface UserRepositoryInterface
{
    public function create(array $attributes);
    public function findByEmail(string $email);
    public function getUserCreationOptions();
}
