<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Signature;
use App\Contracts\Repositories\SignatureRepositoryInterface;

class SignatureRepository implements SignatureRepositoryInterface
{
    public function create(User $user,  $signature)
    {
        return Signature::create([
            'user_id' => $user->id,
            'file_name' => $signature,
        ]);
    }
}
