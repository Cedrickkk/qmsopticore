<?php

namespace App\Services;

use App\Models\User;
use App\Models\Signature;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use App\Contracts\Services\UserServiceInterface;
use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Contracts\Repositories\SignatureRepositoryInterface;

class UserService
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly FileService $fileService,
        private readonly UserServiceInterface $userRepository,
        private readonly DepartmentRepositoryInterface $departmentRepository,
        private readonly SignatureRepositoryInterface $signatureRepository
    ) {}

    public function create(StoreUserRequest $request): User
    {
        $data = $request->validated();

        $departmentId = $this->departmentRepository->findIdByName($data['department']);

        $image = $this->fileService->upload($data['image'], 'avatars');

        return $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'avatar' => $image,
            'position' => $data['position'],
            'password' => Hash::make($request['password']),
            'department_id' => $departmentId,
        ])->assignRole($data['role']);
    }

    public function getUserCreationOptions(): array
    {
        return $this->userRepository->getUserCreationOptions();
    }

    public function createSignature(User $user, Signature $signature)
    {
        return $this->signatureRepository->create($user, $signature);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }
}
