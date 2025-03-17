<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'auth/login');


/**
 * 
 * ! TODO: IMPORTANT
 * * Organize routes based on their permissions & roles.
 * * Use 
 * 
 */

Route::middleware(['auth', 'verified'])->group(function () {
    require __DIR__ . '/dashboard.php';
    require __DIR__ . '/documents.php';
    require __DIR__ . '/departments.php';
    require __DIR__ . '/users.php';
    require __DIR__ . '/archives.php';
});

require __DIR__ . '/api.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
