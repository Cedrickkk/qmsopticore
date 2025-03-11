<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DashboardService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getDashboardStats()
    {
        return [
            'totalDocuments' => Document::count(),
            'totalUsers' => User::count(),
            'documentsGrowth' => $this->getDocumentGrowthPercentage(),
            'usersGrowth' => $this->getUserGrowthPercentage(),
            'documentActivity' => $this->getDocumentActivity()
        ];
    }

    public function getDocumentGrowthPercentage(): float|int
    {
        return $this->calculateGrowthPercentage('Document');
    }

    public function getUserGrowthPercentage(): float|int
    {
        return $this->calculateGrowthPercentage('User');
    }

    public function getDocumentActivity()
    {
        $currentMonth = now();
        $lastMonth = now()->subMonth();

        return Document::selectRaw('
            COUNT(*) as count,
            DATE_FORMAT(created_at, "%Y-%m") as yearMonth,
            DATE_FORMAT(created_at, "%M") as month')
            ->where(function ($query) use ($currentMonth, $lastMonth) {
                $query->whereBetween('created_at', [
                    $lastMonth->startOfMonth(),
                    $lastMonth->endOfMonth()
                ])
                    ->orWhereBetween('created_at', [
                        $currentMonth->startOfMonth(),
                        $currentMonth->endOfMonth()
                    ]);
            })
            ->groupBy('yearMonth', 'month')
            ->orderBy('yearMonth')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'count' => $item->count,
                    'yearMonth' => $item->yearMonth
                ];
            });
    }

    public function getUserDocuments(User $user): Collection
    {
        return Document::query()
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
    }

    private function calculateGrowthPercentage(string $model): float|int
    {
        $currentMonth = now();
        $lastMonth = now()->subMonth();

        $modelClass = "App\\Models\\{$model}";

        $currentMonthCount = $modelClass::whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $lastMonthCount = $modelClass::whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();

        if ($lastMonthCount === 0) {
            return $currentMonthCount > 0 ? 100 : 0;
        }

        return round((($currentMonthCount - $lastMonthCount) / $lastMonthCount) * 100, 1);
    }
}
