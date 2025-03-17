<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/accounts', [UserController::class, 'index'])->name('accounts.index');

Route::get('/accounts/create', [UserController::class, 'create'])->name('accounts.create');

Route::post('/accounts/create', [UserController::class, 'store'])->name('accounts.store');
