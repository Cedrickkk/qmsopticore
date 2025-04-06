<?php

namespace App\Repositories;

use App\Models\User;
use App\Contracts\Services\UserServiceInterface;
use App\Contracts\Repositories\RoleRepositoryInterface;
use App\Contracts\Repositories\DepartmentRepositoryInterface;

class UserRepository implements UserServiceInterface
{

    public function __construct(
        private readonly DepartmentRepositoryInterface $departmentRepository,
        private readonly RoleRepositoryInterface $roleRepository
    ) {}

    public function create(array $attributes)
    {
        return User::create($attributes);
    }

    public function findByEmail(string $email)
    {
        return User::where('email', 'like', "%{$email}%")
            ->select('id', 'name', 'email')
            ->first();
    }

    public function getUserCreationOptions()
    {
        return [
            'departments' => $this->departmentRepository->all(),
            'roles' => $this->roleRepository->all()
        ];
    }

    public function assignRole(User $user, ?string $role = "regular_user")
    {
        return $user->assignRole($role);
    }
}
