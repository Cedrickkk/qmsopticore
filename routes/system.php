<?php

use App\Http\Controllers\BackupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super_admin'])->group(function () {

  Route::prefix('system-settings')->name('system-settings.')->group(function () {

    Route::redirect('/', '/system-settings/dashboard');

    Route::inertia('/dashboard', 'system-settings/dashboard');

    Route::inertia('/appearance', 'system-settings/appearance');

    Route::prefix('/backups')->name('backups.')->group(function () {

      Route::get('/', [BackupController::class, 'index']);
    });

    Route::inertia('/contents', 'system-settings/contents');

    Route::inertia('/documents', 'system-settings/documents');

    Route::inertia('/logs', 'system-settings/logs');
  });
});
