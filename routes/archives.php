<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Documents\ArchivedDocumentController;

Route::middleware(['auth', 'role:super_admin|department_admin'])->group(function () {
  Route::prefix('archives')->name('archives.')->group(function () {
    Route::get('/', [ArchivedDocumentController::class, 'index'])->name('index');

    Route::prefix('{archivedDocument}')->group(function () {
      Route::get('/', [ArchivedDocumentController::class, 'show'])->name('show');
      Route::patch('/unarchive', [ArchivedDocumentController::class, 'unarchive'])->name('unarchive');
    });
  });
});
