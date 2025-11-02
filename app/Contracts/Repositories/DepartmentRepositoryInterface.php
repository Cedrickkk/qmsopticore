<?php
// filepath: c:\Users\Cedric\Desktop\qmsopticore\app\Contracts\Repositories\DepartmentRepositoryInterface.php

namespace App\Contracts\Repositories;

use App\Models\Department;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface DepartmentRepositoryInterface
{
    /**
     * Get all departments
     */
    public function all();

    /**
     * Find department ID by name
     */
    public function findIdByName(string $name);

    /**
     * Get paginated departments with search
     */
    public function getPaginated(?string $search = null, int $perPage = 10): LengthAwarePaginator;

    /**
     * Find department by ID with relationships
     */
    public function findWithRelations(int $id, array $relations = []): ?Department;

    /**
     * Get department users count
     */
    public function getUsersCount(Department $department): int;

    /**
     * Get active users count
     */
    public function getActiveUsersCount(Department $department): int;

    /**
     * Get total documents count
     */
    public function getDocumentsCount(Department $department): int;

    /**
     * Get documents count by status
     */
    public function getDocumentsByStatus(Department $department, string $status): int;

    /**
     * Get documents created in date range
     */
    public function getDocumentsInDateRange(Department $department, $startDate, $endDate): int;

    /**
     * Get monthly documents for specific year and month
     */
    public function getMonthlyDocuments(Department $department, int $year, int $month): int;
}
