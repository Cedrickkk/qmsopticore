<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\UserService;
use App\Http\Requests\StoreUserRequest;

class UserController extends Controller
{
    public function __construct(private readonly UserService $service) {}

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
