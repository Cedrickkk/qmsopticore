<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocumentController;

Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');

Route::get('/documents/create', [DocumentController::class, 'create'])->name('documents.create');

Route::post('/documents/create', [DocumentController::class, 'store'])->name('documents.store');

Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');

Route::get('/documents/{document}/history', [DocumentController::class, 'history'])->name('documents.history');

Route::patch('/documents/{document}/archive', [DocumentController::class, 'archive'])->name('documents.archive');
