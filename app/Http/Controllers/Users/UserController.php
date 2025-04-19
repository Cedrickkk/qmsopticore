<?php

namespace App\Http\Controllers\Users;

use Inertia\Inertia;
use App\Services\FileService;
use App\Services\UserService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
        private readonly FileService $fileService
    ) {}

    public function index(Request $request)
    {
        $currentUser = Auth::user();
        $isDepartmentAdmin = $currentUser->hasRole('department_admin');
        $isSuperAdmin = $currentUser->hasRole('super_admin');

        $accountsQuery = User::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->with('department');

        if ($isDepartmentAdmin && !$isSuperAdmin) {
            $accountsQuery->where('department_id', $currentUser->department_id);
        }

        $accounts = $accountsQuery
            ->latest()
            ->paginate(10)
            ->withQueryString();

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

        $user->sendEmailVerificationNotification();
    }
}
