<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'User Test',
            'email' => 'user@plpasig.edu.ph',
            'email_verified_at' => now(),
            'password' => 'user12345',
            'remember_token' => Str::random(10),
        ])->assignRole(RoleEnum::REGULAR_USER->value);

        User::create([
            'name' => 'Admin Test',
            'email' => 'admin@plpasig.edu.ph',
            'email_verified_at' => now(),
            'password' => 'admin12345',
            'remember_token' => Str::random(10),
        ])->assignRole(RoleEnum::SUPER_ADMIN->value);
    }
}
