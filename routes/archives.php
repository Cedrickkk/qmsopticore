<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArchivedDocumentController;

Route::get('/archives', [ArchivedDocumentController::class, 'index'])->name('archives.index');
