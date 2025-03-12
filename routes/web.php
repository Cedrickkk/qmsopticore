<?php

use App\Http\Controllers\Api\DocumentController as ApiDocumentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Api\UserController as ApiUserController;

Route::inertia('/', 'auth/login')->name('login');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');

    Route::get('/documents/create', [DocumentController::class, 'create'])->name('documents.create');

    Route::post('/documents/create', [DocumentController::class, 'store'])->name('documents.store');

    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');

    Route::get('/documents/{document}/history', [DocumentController::class, 'history'])->name('documents.history');

    Route::inertia('/departments', 'departments')->name('departments');

    Route::get('/accounts', [UserController::class, 'index'])->name('accounts.index');

    Route::get('/accounts/create', [UserController::class, 'create'])->name('accounts.create');

    Route::post('/accounts/create', [UserController::class, 'store'])->name('accounts.storsede');

    Route::inertia('archives', 'archives')->name('archives');

    Route::inertia('system-settings', 'system-settings')->name('system-settings');
});

Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {

    Route::get('users/search', [ApiUserController::class, 'search']);

    Route::get('documents/{document}/download', [ApiDocumentController::class, 'download']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
