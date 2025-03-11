<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use App\Http\Requests\StoreUserRequest;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(private UserService $service) {}

    public function index()
    {
        return Inertia::render('accounts');
    }

    public function create()
    {
        return Inertia::render('accounts/create', $this->service->getUserCreationOptions());
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->service->createUser($request);

        $files = $request->allFiles();

        $signatures = $this->service->uploadSignatures($files);

        foreach ($signatures as $signature) {
            $this->service->createSignature($user->id, $signature);
        }
    }
}
