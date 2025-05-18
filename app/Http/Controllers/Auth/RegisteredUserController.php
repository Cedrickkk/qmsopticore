<?php

namespace App\Http\Controllers\Auth;

use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Services\FileService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{

    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly DepartmentRepositoryInterface $departmentRepository,
        private readonly FileService $fileService
    ) {}

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register', [
            'departments' => $this->departmentRepository->all(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users',
                'ends_with:@plpasig.edu.ph'
            ],
            'password' => ['required', 'string', 'min:8', Password::defaults(), 'confirmed'],
            'department' => ['required', 'string', 'max:255'],
        ]);

        $departmentId = $this->departmentRepository->findIdByName($request->department);

        $user = $this->userRepository->create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'department_id' => $departmentId,
        ])->assignRole(RoleEnum::REGULAR_USER);


        event(new Registered($user));

        Auth::login($user);

        return to_route('documents.index');
    }
}
