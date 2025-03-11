<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;

Route::inertia('/', 'auth/login')->name('login');

Route::middleware(['auth'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents');

    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');

    Route::inertia('/departments', 'departments')->name('archives');

    Route::get('/accounts', [UserController::class, 'index'])->name('accounts');

    Route::get('/accounts/create', [UserController::class, 'create'])->name('accounts.create');

    Route::post('/accounts/create', [UserController::class, 'store'])->name('accounts.storsede');

    Route::inertia('archives', 'archives')->name('archives');

    Route::inertia('system-settings', 'system-settings')->name('system-settings');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
