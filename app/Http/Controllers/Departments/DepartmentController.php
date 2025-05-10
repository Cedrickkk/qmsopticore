<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $departments = Department::query()
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->with('admins')
            ->orderBy('name', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('departments', [
            'departments' => $departments,
        ]);
    }
}
