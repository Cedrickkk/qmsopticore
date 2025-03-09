<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Document;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $documents = Document::count();
        $users = User::count();

        $user = Auth::user();

        $userDocuments = Document::query()
            ->where(function ($query) use ($user) {
                $query->whereHas('recipients', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->orWhereHas('signatories', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
            })
            ->with('creator:id,name,email')
            ->with('category:id,name')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('dashboard', [
            'totalDocuments' => $documents,
            'totalUsers' => $users,
            'userDocuments' => $userDocuments,
        ]);
    }
}
