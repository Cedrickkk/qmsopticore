<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::group(['middleware' => ['role:super_admin|department_admin']], function () {
  Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});
