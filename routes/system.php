<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Settings\SystemSettingController;

Route::group(['middleware' => ['role:super_admin']], function () {
  Route::get('/system-settings', [SystemSettingController::class, 'index'])->name('system-settings');
});
