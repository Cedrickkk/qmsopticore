<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::inertia('/', 'auth/login')->name('login');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('documents', [DocumentController::class, 'index'])->name('documents');

    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');

    Route::get('departments', function () {
        return Inertia::render('departments');
    })->name('departments');

    Route::get('accounts', function () {
        return Inertia::render('accounts');
    })->name('accounts');

    Route::get('archives', function () {
        return Inertia::render('archives');
    })->name('archives');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
