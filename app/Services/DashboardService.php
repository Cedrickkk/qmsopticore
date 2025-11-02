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

    public function getDashboardStats($departmentId = null)
    {
        return [
            'totalDocuments' => $this->getTotalDocuments($departmentId),
            'totalUsers' => $this->getTotalUsers($departmentId),
            'documentsGrowth' => $this->getDocumentGrowthPercentage($departmentId),
            'usersGrowth' => $this->getUserGrowthPercentage($departmentId),
            'documentActivity' => $this->getWeeklyDocumentActivity($departmentId)
        ];
    }

    public function getTotalDocuments($departmentId = null): int
    {
        $query = Document::query();

        if ($departmentId) {
            $query->where(function ($q) use ($departmentId) {
                $q->whereHas('createdBy', function ($userQuery) use ($departmentId) {
                    $userQuery->where('department_id', $departmentId);
                })
                    ->orWhereHas('recipients', function ($recipientQuery) use ($departmentId) {
                        $recipientQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    })
                    ->orWhereHas('signatories', function ($signatoryQuery) use ($departmentId) {
                        $signatoryQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    });
            });
        }

        return $query->count();
    }

    private function getTotalUsers($departmentId = null): int
    {
        $query = User::query();

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        return $query->count();
    }

    public function getDocumentGrowthPercentage($departmentId = null): float|int
    {
        return $this->calculateGrowthPercentage('Document', $departmentId);
    }

    public function getUserGrowthPercentage($departmentId = null): float|int
    {
        return $this->calculateGrowthPercentage('User', $departmentId);
    }

    public function getWeeklyDocumentActivity($departmentId = null)
    {
        $endDate = now();
        $startDate = now()->subWeeks(4);

        $query = Document::selectRaw('
        COUNT(*) as count,
        YEARWEEK(created_at, 1) as yearWeek,
        CONCAT("Week ", WEEK(created_at, 1) - WEEK(DATE_SUB(created_at, INTERVAL DAYOFMONTH(created_at)-1 DAY), 1) + 1, 
               " (", DATE_FORMAT(created_at, "%b %d"), " - ", 
               DATE_FORMAT(DATE_ADD(created_at, INTERVAL 6 - WEEKDAY(created_at) DAY), "%b %d"), ")") as weekLabel')
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<=', $endDate);

        if ($departmentId) {
            $query->where(function ($q) use ($departmentId) {
                $q->whereHas('createdBy', function ($userQuery) use ($departmentId) {
                    $userQuery->where('department_id', $departmentId);
                })
                    ->orWhereHas('recipients', function ($recipientQuery) use ($departmentId) {
                        $recipientQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    })
                    ->orWhereHas('signatories', function ($signatoryQuery) use ($departmentId) {
                        $signatoryQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    });
            });
        }

        return $query->groupBy('yearWeek', 'weekLabel')
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

    public function getMonthlyDocumentActivity($departmentId = null)
    {
        $currentMonth = now();
        $lastMonth = now()->subMonth();

        $query = Document::selectRaw('
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
            });

        if ($departmentId) {
            $query->where(function ($q) use ($departmentId) {
                $q->whereHas('createdBy', function ($userQuery) use ($departmentId) {
                    $userQuery->where('department_id', $departmentId);
                })
                    ->orWhereHas('recipients', function ($recipientQuery) use ($departmentId) {
                        $recipientQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    })
                    ->orWhereHas('signatories', function ($signatoryQuery) use ($departmentId) {
                        $signatoryQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    });
            });
        }

        return $query->groupBy('yearMonth', 'month')
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

    public function getUserRecentDocuments(string $userId, $departmentId = null): Collection
    {
        $query = Document::query()
            ->where(function ($query) use ($userId) {
                $query->whereHas('recipients', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })->orWhereHas('signatories', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                });
            })
            ->orWhere('created_by', $userId);

        if ($departmentId) {
            $query->where(function ($q) use ($departmentId) {
                $q->whereHas('createdBy', function ($userQuery) use ($departmentId) {
                    $userQuery->where('department_id', $departmentId);
                })
                    ->orWhereHas('recipients', function ($recipientQuery) use ($departmentId) {
                        $recipientQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    })
                    ->orWhereHas('signatories', function ($signatoryQuery) use ($departmentId) {
                        $signatoryQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                            $userQuery->where('department_id', $departmentId);
                        });
                    });
            });
        }

        return $query->with('createdBy:id,name,email')
            ->with('category:id,name')
            ->orderBy('created_at', 'desc')
            ->latest()
            ->take(10)
            ->get();
    }

    public function calculateGrowthPercentage(string $model, $departmentId = null): float|int
    {
        $currentMonth = now();
        $lastMonth = now()->subMonth();

        $modelClass = "App\\Models\\{$model}";
        $query = $modelClass::query();

        if ($departmentId) {
            if ($model === 'User') {
                $query->where('department_id', $departmentId);
            } elseif ($model === 'Document') {
                $query->where(function ($q) use ($departmentId) {
                    $q->whereHas('createdBy', function ($userQuery) use ($departmentId) {
                        $userQuery->where('department_id', $departmentId);
                    })
                        ->orWhereHas('recipients', function ($recipientQuery) use ($departmentId) {
                            $recipientQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                                $userQuery->where('department_id', $departmentId);
                            });
                        })
                        ->orWhereHas('signatories', function ($signatoryQuery) use ($departmentId) {
                            $signatoryQuery->whereHas('user', function ($userQuery) use ($departmentId) {
                                $userQuery->where('department_id', $departmentId);
                            });
                        });
                });
            }
        }

        $currentMonthCount = (clone $query)->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $lastMonthCount = (clone $query)->whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();

        if ($lastMonthCount === 0) {
            return $currentMonthCount > 0 ? 100 : 0;
        }
        return round((($currentMonthCount - $lastMonthCount) / $lastMonthCount) * 100, 1);
    }
}
