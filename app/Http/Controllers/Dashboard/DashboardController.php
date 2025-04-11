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
        $user = User::find(Auth::user()->id)->first();

        $stats = $this->service->getDashboardStats();

        $userDocuments = $this->service->getUserDocuments($user);

        return Inertia::render('dashboard', [
            'totalDocuments' => $stats['totalDocuments'],
            'totalUsers' => $stats['totalUsers'],
            'userDocuments' => $userDocuments,
            'stats' => [
                'documentsGrowth' => $stats['documentsGrowth'],
                'usersGrowth' => $stats['usersGrowth'],
                'documentActivity' => $stats['documentActivity']
            ],
        ]);
    }
}
