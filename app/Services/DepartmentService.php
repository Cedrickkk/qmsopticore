<?php
// filepath: c:\Users\Cedric\Desktop\qmsopticore\app\Services\DepartmentService.php

namespace App\Services;

use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Models\Department;

class DepartmentService
{
  public function __construct(
    protected DepartmentRepositoryInterface $repository
  ) {}

  /**
   * Get department statistics
   */
  public function getDepartmentStats(Department $department): array
  {
    $totalUsers = $this->repository->getUsersCount($department);
    $activeUsers = $this->repository->getActiveUsersCount($department);
    $totalDocuments = $this->repository->getDocumentsCount($department);
    $pendingDocuments = $this->repository->getDocumentsByStatus($department, 'in_review');
    $approvedDocuments = $this->repository->getDocumentsByStatus($department, 'published');
    $rejectedDocuments = $this->repository->getDocumentsByStatus($department, 'rejected');
    $publishedDocuments = $this->repository->getDocumentsByStatus($department, 'published');

    return [
      'totalUsers' => $totalUsers,
      'activeUsers' => $activeUsers,
      'totalDocuments' => $totalDocuments,
      'pendingDocuments' => $pendingDocuments,
      'approvedDocuments' => $approvedDocuments,
      'rejectedDocuments' => $rejectedDocuments,
      'publishedDocuments' => $publishedDocuments,
      'documentsGrowth' => $this->calculateDocumentsGrowth($department),
    ];
  }

  /**
   * Calculate documents growth percentage
   */
  protected function calculateDocumentsGrowth(Department $department): float
  {
    $currentPeriodDocs = $this->repository->getDocumentsInDateRange(
      $department,
      now()->subDays(30),
      now()
    );

    $previousPeriodDocs = $this->repository->getDocumentsInDateRange(
      $department,
      now()->subDays(60),
      now()->subDays(30)
    );

    if ($previousPeriodDocs === 0) {
      return 0;
    }

    return round((($currentPeriodDocs - $previousPeriodDocs) / $previousPeriodDocs) * 100, 1);
  }

  /**
   * Get monthly chart data for last 6 months
   */
  public function getMonthlyChartData(Department $department): array
  {
    return collect(range(5, 0))->map(function ($monthsAgo) use ($department) {
      $date = now()->subMonths($monthsAgo);
      $count = $this->repository->getMonthlyDocuments(
        $department,
        $date->year,
        $date->month
      );

      return [
        'month' => strtolower($date->format('F')),
        'documents' => $count,
      ];
    })->values()->toArray();
  }

  /**
   * Format department data for frontend
   */
  public function formatDepartmentData(Department $department): array
  {
    return [
      'id' => $department->id,
      'name' => $department->name,
      'code' => $department->code,
      'description' => $department->description,
      'created_at' => $department->created_at,
      'admins' => $department->admins->map(fn($admin) => [
        'id' => $admin->id,
        'name' => $admin->name,
        'email' => $admin->email,
        'position' => $admin->position ?? null,
        'avatar' => $admin->avatar ?? null,
      ])->toArray(),
    ];
  }
}
