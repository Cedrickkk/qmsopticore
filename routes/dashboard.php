<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\DashboardController;

Route::group(['middleware' => ['role:super_admin|department_admin']], function () {
  Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});
