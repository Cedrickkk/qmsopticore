<?php

namespace App\Http\Controllers\Api;

use App\Services\FileService;
use Illuminate\Http\Request;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $service,
        private readonly FileService $fileService,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $request->validate(rules: ['email' => 'required|email|ends_with:@plpasig.edu.ph']);

        $user = $this->service->findByEmail($request->query('email'));

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        if ($user->id === Auth::user()->id) {
            return response()->json([
                'message' => "You cannot add yourself as a recipient."
            ], 400);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $this->fileService->getUrlPath($user->avatar ?? "", 'avatars'),
            ]
        ], 200);
    }

    public function searchRepresentative(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|ends_with:@plpasig.edu.ph']);

        $user = $this->service->findByEmailWithDepartment($request->query('email'));

        $mainSignatory = User::find(Auth::id());

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        if ($user->id === $mainSignatory->id) {
            return response()->json([
                'message' => "You cannot assign yourself as a representative."
            ], 400);
        }

        if (!$mainSignatory->department) {
            return response()->json([
                'message' => 'You do not have a department assigned. Please contact the administrator.'
            ], 400);
        }

        if (!$user->department) {
            return response()->json([
                'message' => 'This user does not have a department assigned. Please contact the administrator.'
            ], 400);
        }

        if ($user->department->id !== $mainSignatory->department->id) {
            return response()->json([
                'message' => "Representative must be from your department ({$mainSignatory->department->name})."
            ], 400);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'position' => $user->position,
                'avatar' => $this->fileService->getUrlPath($user->avatar ?? "", 'avatars'),
                'department' => $user->department,
            ]
        ], 200);
    }
}
