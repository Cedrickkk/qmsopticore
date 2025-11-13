<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Documents\DocumentController;
use App\Http\Controllers\Documents\ArchivedDocumentController;

Route::middleware(['auth', 'role:super_admin|department_admin|regular_user', 'permission'])->group(function () {
  Route::prefix('documents')->name('documents.')->group(function () {
    Route::get('/', [DocumentController::class, 'index'])->name('index');
    Route::get('/create', [DocumentController::class, 'create'])->name('create');
    Route::post('/create', [DocumentController::class, 'store'])->name('store');

    Route::prefix('/{document}')->group(function () {
      Route::get('/', [DocumentController::class, 'show'])->name('show');
      Route::get('/history', [DocumentController::class, 'history'])->name('history');

      Route::post('/approve', [DocumentController::class, 'approve'])->name('approve');
      Route::post('/reject', [DocumentController::class, 'reject'])->name('reject');
      Route::post('/access', [DocumentController::class, 'updateAccess'])->name('access.update');

      Route::post('/set-representative', [DocumentController::class, 'setRepresentative'])->name('set-representative');
      Route::delete('/remove-representative', [DocumentController::class, 'removeRepresentative'])->name('remove-representative');

      Route::get('/authenticate', [DocumentController::class, 'showAuthForm'])->name('authenticate');
      Route::post('/authenticate', [DocumentController::class, 'authenticate'])->name('authenticate.verify');
      Route::post('/verify-access', [DocumentController::class, 'verifyAccess'])->name('verify-access');

      Route::patch('/archive', [ArchivedDocumentController::class, 'archive'])->name('archive');
    });
  });
});
