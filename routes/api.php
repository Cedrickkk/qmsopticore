<?php

use App\Http\Controllers\Api\SignatureController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController as ApiUserController;
use App\Http\Controllers\Api\DocumentController as ApiDocumentController;
use App\Http\Controllers\BackupController;

Route::middleware(['auth', 'verified'])->group(function () {
  Route::prefix('api')->name('api.')->group(function () {
    Route::get('/users/search', [ApiUserController::class, 'search']);
    Route::get('/users/search-representative', [ApiUserController::class, 'searchRepresentative']);

    Route::get('/documents/{document}/download', [ApiDocumentController::class, 'download']);
    Route::post('/documents/bulk-download', [ApiDocumentController::class, 'bulkDownload']);

    Route::post('/validate-signatures', [SignatureController::class, 'validate']);

    Route::prefix('backups')->name('backups.')->group(function () {
      Route::post('/', [BackupController::class, 'store'])->name('store');
      Route::post('/documents', [BackupController::class, 'storeDocumentBackup'])->name('documents.store');
      Route::post('/clean', [BackupController::class, 'clean'])->name('clean');
      Route::get('/{backup}/download', [BackupController::class, 'download'])->name('download');
      Route::delete('/{backup}', [BackupController::class, 'destroy'])->name('destroy');
    });
  });
});
