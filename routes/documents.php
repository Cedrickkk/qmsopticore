<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Documents\DocumentController;
use App\Http\Controllers\Documents\ArchivedDocumentController;

Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');

Route::get('/documents/create', [DocumentController::class, 'create'])->name('documents.create');

Route::post('/documents/create', [DocumentController::class, 'store'])->name('documents.store');

Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');

Route::post('/documents/{document}/approve', [DocumentController::class, 'approve'])->name('document.approve');

Route::post('/documents/{document}/access', [DocumentController::class, 'updateAccess'])->name('documents.access.update');

Route::post('/documents/{document}/reject', [DocumentController::class, 'reject'])->name('document.reject');

Route::get('/documents/{document}/history', [DocumentController::class, 'history'])->name('documents.history');

Route::patch('/documents/{document}/archive', [DocumentController::class, 'archive'])->name('documents.archive');

Route::patch('/documents/{document}/unarchive', [ArchivedDocumentController::class, 'unarchive'])->name('document.unarchive');
