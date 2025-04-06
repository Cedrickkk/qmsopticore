<?php

namespace App\Contracts\Repositories;

use App\Models\User;
use App\Models\Signature;

interface SignatureRepositoryInterface
{
    public function create(User $user, Signature $signature);
}
