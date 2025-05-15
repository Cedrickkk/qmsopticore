<?php

namespace App\Repositories;

use App\Models\User;
use App\Contracts\Repositories\RoleRepositoryInterface;
use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
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
            ->select('id', 'name', 'email', 'avatar')
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

    public function paginate(?string $search = null, ?int $departmentId = null)
    {
        $query = User::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($departmentId, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with('department');

        return $query->latest()->paginate(10)->withQueryString();
    }
}
