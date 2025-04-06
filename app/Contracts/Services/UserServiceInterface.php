<?php

namespace App\Contracts\Services;


interface UserServiceInterface
{
    public function create(array $attributes);
    public function findByEmail(string $email);
    public function getUserCreationOptions();
}
