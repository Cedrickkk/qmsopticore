<?php

namespace App\Http\Controllers;

use App\Services\FileService;
use Inertia\Inertia;
use App\Services\UserService;
use App\Http\Requests\StoreUserRequest;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
        private readonly FileService $fileService
    ) {}

    public function index()
    {
        return Inertia::render('accounts');
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
