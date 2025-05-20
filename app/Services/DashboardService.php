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
            'documentActivity' => $this->getWeeklyDocumentActivity()
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

    public function getWeeklyDocumentActivity()
    {
        $endDate = now();
        $startDate = now()->subWeeks(4);

        return Document::selectRaw('
        COUNT(*) as count,
        YEARWEEK(created_at, 1) as yearWeek,
        CONCAT("Week ", WEEK(created_at, 1) - WEEK(DATE_SUB(created_at, INTERVAL DAYOFMONTH(created_at)-1 DAY), 1) + 1, 
               " (", DATE_FORMAT(created_at, "%b %d"), " - ", 
               DATE_FORMAT(DATE_ADD(created_at, INTERVAL 6 - WEEKDAY(created_at) DAY), "%b %d"), ")") as weekLabel')
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<=', $endDate)
            ->groupBy('yearWeek', 'weekLabel')
            ->orderBy('yearWeek')
            ->get()
            ->map(function ($item) {
                return [
                    'week' => $item->weekLabel,
                    'count' => $item->count,
                    'yearWeek' => $item->yearWeek
                ];
            });
    }

    public function getMonthlyDocumentActivity()
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

    public function getUserRecentDocuments(string $userId): Collection
    {
        return Document::query()
            ->where(function ($query) use ($userId) {
                $query->whereHas('recipients', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })->orWhereHas('signatories', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                });
            })
            ->orWhere('created_by', $userId)
            ->with('createdBy:id,name,email')
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
