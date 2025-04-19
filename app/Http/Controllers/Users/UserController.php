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

        $user->sendEmailVerificationNotification();
    }
}
