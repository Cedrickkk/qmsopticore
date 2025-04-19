<?php

use App\Http\Controllers\Departments\DepartmentController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['role:super_admin|department_admin']], function () {
  Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
});
