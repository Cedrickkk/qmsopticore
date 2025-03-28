<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $service
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
            'user' => $user
        ], 200);
    }
}
