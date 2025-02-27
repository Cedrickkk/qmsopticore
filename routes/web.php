<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('login');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('documents', function () {
        return Inertia::render('documents/index');
    })->name('documents');

    Route::get('departments', function () {
        return Inertia::render('departments/index');
    })->name('departments');

    Route::get('accounts', function () {
        return Inertia::render('accounts/index');
    })->name('accounts');

    Route::get('archives', function () {
        return Inertia::render('archives/index');
    })->name('archives');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
