<?php

namespace App\Repositories;

use App\Models\Department;
use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Services\UserService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DepartmentRepository implements DepartmentRepositoryInterface
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        protected Department $model,
    ) {}


    /**
     * Get all departments
     */
    public function all()
    {
        return $this->model->all();
    }

    /**
     * Find department ID by name
     */
    public function findIdByName(string $name)
    {
        return $this->model->where('name', $name)->value('id');
    }

    /**
     * Get paginated departments with search
     */
    public function getPaginated(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->with('admins')
            ->withCount(['users', 'documents'])
            ->orderBy('name', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Find department by ID with relationships
     */
    public function findWithRelations(int $id, array $relations = []): ?Department
    {
        return $this->model->with($relations)->find($id);
    }

    /**
     * Get department users count
     */
    public function getUsersCount(Department $department): int
    {
        return $department->users()->count();
    }

    /**
     * Get active users count
     */
    public function getActiveUsersCount(Department $department): int
    {
        return $department->users
            ->filter(fn($user) => $this->isCurrentlyLoggedIn($user->id))
            ->count();
    }


    private function isCurrentlyLoggedIn(string $userId)
    {
        return DB::table('sessions')
            ->where('user_id', $userId)
            ->where('last_activity', '>=', now()->subMinutes(config('session.lifetime', 120))->timestamp)
            ->exists();
    }

    /**
     * Get total documents count
     */
    public function getDocumentsCount(Department $department): int
    {
        return $department->documents()->count();
    }

    /**
     * Get documents count by status
     */
    public function getDocumentsByStatus(Department $department, string $status): int
    {
        return $department->documents()->where('status', $status)->count();
    }

    /**
     * Get documents created in date range
     */
    public function getDocumentsInDateRange(Department $department, $startDate, $endDate): int
    {
        return $department->documents()
            ->whereBetween('documents.created_at', [$startDate, $endDate])
            ->count();
    }

    /**
     * Get monthly documents for specific year and month
     */
    public function getMonthlyDocuments(Department $department, int $year, int $month): int
    {
        return $department->documents()
            ->whereYear('documents.created_at', $year)
            ->whereMonth('documents.created_at', $month)
            ->count();
    }
}
