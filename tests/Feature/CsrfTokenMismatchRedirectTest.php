<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Route::middleware(['web', 'auth'])
        ->post('/csrf-test', fn() => 'ok');
});

test('authenticated user with missing CSRF token is redirected to login', function () {
    $department = Department::create(['name' => 'Test Department']);
    $user = User::factory()->create(['department_id' => $department->id]);

    $response = $this->actingAs($user)->post('/csrf-test');
    $response->assertRedirect(route('login'));
});

test('authenticated user with invalid CSRF token is redirected to login', function () {
    $department = Department::create(['name' => 'Test Department']);
    $user = User::factory()->create(['department_id' => $department->id]);

    $response = $this->actingAs($user)->post('/csrf-test', [
        '_token' => 'invalid_csrf_token',
    ]);

    $response->assertRedirect(route('login'));
});
