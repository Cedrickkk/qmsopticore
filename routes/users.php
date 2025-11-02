<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Users\UserController;

Route::middleware(['auth', 'role:super_admin|department_admin'])->group(function () {
  Route::prefix('accounts')->name('accounts.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::post('/create', [UserController::class, 'store'])->name('store');
    Route::get('/create', [UserController::class, 'create'])->name('create');

    Route::prefix('/{user}')->name('show.')->group(function () {
      Route::get('/', [UserController::class, 'show'])->name('show');
      Route::get('/summary', [UserController::class, 'summary'])->name('summary');
      Route::get('/activity', [UserController::class, 'activity'])->name('activity');
      Route::get('/documents', [UserController::class, 'documents'])->name('documents');
      Route::get('/settings', [UserController::class, 'settings'])->name('settings');
      Route::get('/permissions', [UserController::class, 'permissions'])->name('permissions');
    });
  });
});
