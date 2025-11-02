<?php

namespace App\Services;

use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Contracts\Repositories\SignatureRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Enums\RoleEnum;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private readonly FileService $fileService,
        private readonly UserRepositoryInterface $userRepository,
        private readonly DepartmentRepositoryInterface $departmentRepository,
        private readonly SignatureRepositoryInterface $signatureRepository,
    ) {}

    public function create(StoreUserRequest $request): User
    {
        $data = $request->validated();

        $departmentId = $this->departmentRepository->findIdByName($data['department']);

        $avatarFilename = $this->fileService->upload($data['image'], 'avatars', $data['image']->getClientOriginalName());

        return $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'avatar' => $avatarFilename,
            'position' => $data['position'],
            'password' => Hash::make($request['password']),
            'department_id' => $departmentId,
        ])->assignRole($data['role']);
    }

    public function getUserCreationOptions(): array
    {
        return $this->userRepository->getUserCreationOptions();
    }

    public function createSignature(User $user, $signature)
    {
        return $this->signatureRepository->create($user, $signature);
    }

    public function getSignatures(User $user)
    {
        $signatureFilePaths = [];

        $signatures = $user->signatures()->get(['file_name']);

        foreach ($signatures as $signature) {
            $signatureFilePaths[] = $this->fileService->getUrlPath("$signature->file_name", 'signatures');
        }

        return $signatureFilePaths;
    }

    public function getPaginatedUsers(Request $request)
    {
        $currentUser = Auth::user();

        $departmentId = null;

        if ($currentUser->hasRole(RoleEnum::DEPARTMENT_ADMIN->value) && ! $currentUser->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            $departmentId = $currentUser->department_id;
        }

        $users = $this->userRepository->paginate($request->search, $departmentId);

        $users->getCollection()->transform(function ($user) {
            $user->online_status = $this->getOnlineStatus($user->id);
            return $user;
        });

        return $users;
    }

    public function findByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    public function findByEmailWithDepartment(string $email): ?User
    {
        return $this->userRepository->findByEmailWithDepartment($email);
    }

    public function getUserProfileData(User $user)
    {
        $user->load(['roles:id,name', 'department:id,name']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'position' => $user->position,
            'roles' => $user->getRoleNames(),
            'department' => $user->department,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'email_verified_at' => $user->email_verified_at,
            'online_status' => $this->getOnlineStatus($user->id),
            'is_email_verified' => $user->hasVerifiedEmail(),
            'is_currently_logged_in' => $this->isCurrentlyLoggedIn($user->id),
        ];
    }

    public function isCurrentlyLoggedIn(string $userId)
    {
        return DB::table('sessions')
            ->where('user_id', $userId)
            ->where('last_activity', '>=', now()->subMinutes(config('session.lifetime', 120))->timestamp)
            ->exists();
    }

    public function getOnlineStatus(string $userId)
    {
        return $this->isCurrentlyLoggedIn($userId) ? 'Active' : 'Inactive';
    }

    public function getUser()
    {
        return User::where('id', Auth::user()->id)->first();
    }

    public function groupPermissionByEntity($permissions)
    {
        $grouped = [];

        foreach ($permissions as $permission) {
            $parts = explode(':', $permission->name);
            $entity = $parts[0] ?? 'other';
            $action = $parts[1] ?? $permission->name;

            $entityTitle = ucfirst($entity);

            $entityTitles = [
                'document' => 'Documents',
                'user' => 'User Management',
                'department' => 'Departments',
                'system' => 'System Administration',
                'report' => 'Reports',
                'workflow' => 'Workflow',
            ];

            $entityTitle = $entityTitles[$entity] ?? ucfirst($entity);

            if (!isset($grouped[$entityTitle])) {
                $grouped[$entityTitle] = [
                    'type' => $entity,
                    'title' => $entityTitle,
                    'permissions' => []
                ];
            }

            $grouped[$entityTitle]['permissions'][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'action' => $action,
                'title' => $this->getPermissionTitle($action),
                'description' => $this->getPermissionDescription($entity, $action),
            ];
        }

        return array_values($grouped);
    }

    public function getPermissionTitle($action)
    {
        $titles = [
            'create' => 'Create',
            'view' => 'View',
            'edit' => 'Edit',
            'delete' => 'Delete',
            'download' => 'Download',
            'sign' => 'Sign/Approve',
            'reject' => 'Reject',
            'archive' => 'Archive',
            'revoke_access' => 'Revoke Access',
            'manage_access' => 'Manage Access',
            'manage_permissions' => 'Manage Permissions',
        ];

        return $titles[$action] ?? ucfirst(str_replace('_', ' ', $action));
    }

    public function getPermissionDescription($entity, $action)
    {
        $descriptions = [
            'document' => [
                'create' => 'Create new documents',
                'view' => 'View documents',
                'edit' => 'Edit document details',
                'delete' => 'Delete documents',
                'download' => 'Download document files',
                'sign' => 'Approve and sign documents',
                'reject' => 'Reject document approval',
                'archive' => 'Archive documents',
                'manage_access' => 'Control document access permissions',
            ],
            'user' => [
                'create' => 'Create new user accounts',
                'view' => 'View user profiles and information',
                'edit' => 'Edit user account details',
                'delete' => 'Delete user accounts',
                'manage_permissions' => 'Assign and manage user permissions',
            ],
            'department' => [
                'create' => 'Create new departments',
                'view' => 'View department information',
                'edit' => 'Edit department details',
                'delete' => 'Delete departments',
            ],
        ];

        return $descriptions[$entity][$action] ?? "Perform {$action} operations on {$entity}";
    }
}
