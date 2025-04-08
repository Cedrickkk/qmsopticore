<?php

namespace App\Contracts\Repositories;

use App\Models\User;

interface SignatureRepositoryInterface
{
    public function create(User $user, $signature);
}
