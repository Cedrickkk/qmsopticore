<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArchivedDocumentController;


Route::group(['middleware' => ['role:super_admin|department_admin']], function () {
  Route::get('/archives', [ArchivedDocumentController::class, 'index'])->name('archives.index');
});
