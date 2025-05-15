<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\User;
use Inertia\Inertia;
use App\Services\DashboardService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $service) {}

    public function index()
    {
        $userId = User::find(Auth::id())->id;

        $stats = $this->service->getDashboardStats();

        $userRecentDocuments = $this->service->getUserRecentDocuments($userId);

        return Inertia::render('dashboard', [
            'totalDocuments' => $stats['totalDocuments'],
            'totalUsers' => $stats['totalUsers'],
            'userRecentDocuments' => $userRecentDocuments,
            'stats' => [
                'documentsGrowth' => $stats['documentsGrowth'],
                'usersGrowth' => $stats['usersGrowth'],
                'documentActivity' => $stats['documentActivity']
            ],
        ]);
    }
}
