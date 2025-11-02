<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\User;
use Inertia\Inertia;
use App\Services\DashboardService;
use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $service) {}

    public function index()
    {
        $user = User::find(Auth::id());

        $departmentDistribution = Department::withCount('users')
            ->orderBy('users_count', 'desc')
            ->get()
            ->map(function ($dept) {
                return [
                    'department' => [
                        'name' => $dept->name,
                        'code' => $dept->code,
                    ],
                    'users' => $dept->users_count,
                ];
            });

        $departmentId = null;

        if ($user->hasRole('department_admin') && !$user->hasRole('super_admin')) {
            $departmentId = $user->department_id;
        }

        $stats = $this->service->getDashboardStats($departmentId);

        $userRecentDocuments = $this->service->getUserRecentDocuments($user->id, $departmentId);


        return Inertia::render('dashboard', [
            'totalDocuments' => $stats['totalDocuments'],
            'totalUsers' => $stats['totalUsers'],
            'userRecentDocuments' => $userRecentDocuments,
            'departmentDistribution' => $departmentDistribution,
            'stats' => [
                'documentsGrowth' => $stats['documentsGrowth'],
                'usersGrowth' => $stats['usersGrowth'],
                'documentActivity' => $stats['documentActivity']
            ],
        ]);
    }
}
