<?php

use App\Http\Controllers\Departments\DepartmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super_admin'])->group(function () {
  Route::prefix('departments')->name('departments.')->group(function () {
    Route::get('/', [DepartmentController::class, 'index'])->name('index');

    Route::get('/{department}', [DepartmentController::class, 'show'])->name('show');
  });
});
