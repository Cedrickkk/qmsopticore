<?php

use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['role:super_admin|department_admin']], function () {
  Route::inertia('/departments', 'departments')->name('departments');
});
