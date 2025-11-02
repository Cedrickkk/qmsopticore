<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\DocumentService;
use App\Services\FileService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
        private readonly FileService $fileService,
        private readonly DocumentService $documentService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request)
    {
        $accounts = $this->userService->getPaginatedUsers($request);

        return Inertia::render('accounts', [
            'accounts' => $accounts
        ]);
    }

    public function create()
    {
        return Inertia::render('accounts/create', $this->userService->getUserCreationOptions());
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $user = $this->userService->create($request);

        $signatures = $this->fileService->uploadMultiple($data['signatures'], 'signatures');

        foreach ($signatures as $signature) {
            $this->userService->createSignature($user, $signature);
        }
    }

    public function show(User $user)
    {
        return redirect()->route('accounts.show.summary', $user);
    }

    public function summary(User $user)
    {
        return Inertia::render('accounts/summary', [
            'user' => $this->userService->getUserProfileData($user),
        ]);
    }

    public function activity(User $user, Request $request)
    {
        $activities = $this->activityLogService->getUserActivityLogs(
            userId: $user->id,
            perPage: $request->get('per_page', 10),
        );

        return Inertia::render('accounts/activity', [
            'user' => $this->userService->getUserProfileData($user),
            'activities' => $activities,
        ]);
    }

    public function documents(User $user)
    {
        return Inertia::render('accounts/documents', [
            'user' => $this->userService->getUserProfileData($user),
            'authorized_documents' => $this->documentService->getPaginatedAuthorizedDocuments($user),
        ]);
    }

    public function permissions(User $user)
    {
        $userPermissions = $user->getPermissionsViaRoles();

        $groupedPermissions = $this->userService->groupPermissionByEntity($userPermissions);

        return Inertia::render('accounts/permissions', [
            'user' => $this->userService->getUserProfileData($user),
            'permissions'   => $groupedPermissions,
        ]);
    }
}
