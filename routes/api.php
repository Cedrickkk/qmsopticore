<?php

use App\Http\Controllers\Api\SignatureController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController as ApiUserController;
use App\Http\Controllers\Api\DocumentController as ApiDocumentController;

Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
  Route::get('users/search', [ApiUserController::class, 'search']);
  Route::get('documents/{document}/download', [ApiDocumentController::class, 'download']);
  Route::post('/validate-signatures', [SignatureController::class, 'validate']);
});
