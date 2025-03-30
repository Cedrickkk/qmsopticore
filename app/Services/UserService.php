<?php

namespace App\Services;

use App\Models\User;
use App\Models\Signature;
use App\Models\Department;
use Illuminate\Support\Arr;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    /**
     * Create a new class instance.
     */
    public function __construct() {}

    public function createUser(StoreUserRequest $request): User
    {
        $departmentId = Department::where('name', $request->department)->value('id');

        $image = $this->uploadImage($request->file('image'));

        return User::create(attributes: [
            'name' => $request->name,
            'email' => $request->email,
            'img' => $image,
            'password' => Hash::make($request->password),
            'department_id' => $departmentId,
        ]);
    }

    public function createSignature(string $id, string $fileName): Signature
    {
        return Signature::create([
            'user_id' => $id,
            'file_name' => $fileName,
        ]);
    }

    public function uploadSignatures(array $files): array
    {
        $signatures = [];

        foreach (Arr::get($files, 'signatures') as $signature) {
            $path = Storage::putFile('signatures', $signature);
            $signatures[] = basename($path);
        }

        return $signatures;
    }

    public function uploadImage(string $image)
    {
        $path = Storage::putFile('user_img', $image);

        return basename($path);
    }


    public function getUserCreationOptions(): array
    {
        return [
            'departments' => $this->getDepartments(),
            'roles' => $this->getRoles()
        ];
    }

    private function getDepartments(): Collection
    {
        return Department::select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    private function getRoles()
    {
        return Role::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', 'like', "%{$email}%")
            ->select('id', 'name', 'email')
            ->first();
    }
}
