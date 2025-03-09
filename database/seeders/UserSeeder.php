<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create(
            [
                'name' => 'User Test',
                'email' => 'user@gmail.com',
                'email_verified_at' => now(),
                'password' => 'user12345',
                'remember_token' => Str::random(10),
            ]
        );
    }
}
