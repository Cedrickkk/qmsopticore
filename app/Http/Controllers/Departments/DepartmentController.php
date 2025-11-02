<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Repositories\DepartmentRepository;
use App\Services\DepartmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function __construct(
        protected DepartmentRepository $repository,
        protected DepartmentService $service
    ) {}

    /**
     * Display a listing of departments
     */
    public function index(Request $request)
    {
        $departments = $this->repository->getPaginated(
            search: $request->search,
            perPage: 10
        );

        return Inertia::render('departments', [
            'departments' => $departments,
        ]);
    }

    /**
     * Display the specified department
     */
    public function show(Department $department)
    {
        // Load relationships
        $department = $this->repository->findWithRelations(
            $department->id,
            ['admins', 'users', 'documents']
        );

        // Get formatted data
        $departmentData = $this->service->formatDepartmentData($department);
        $stats = $this->service->getDepartmentStats($department);
        $chartData = $this->service->getMonthlyChartData($department);

        return Inertia::render('departments/show', [
            'department' => $departmentData,
            'stats' => $stats,
            'chartData' => $chartData,
        ]);
    }
}
