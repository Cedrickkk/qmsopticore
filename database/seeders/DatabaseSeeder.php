<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            DepartmentSeeder::class,
            DocumentTypeSeeder::class,
            DocumentCategorySeeder::class,
        ]);

        User::create([
            'name' => 'Admin Test',
            'email' => 'admin@plpasig.edu.ph',
            'department_id' => 1,
            'avatar' => null,
            'email_verified_at' => now(),
            'position' => 'System Administrator',
            'password' => Hash::make('admin12345'),
            'remember_token' => Str::random(10),
        ])->assignRole(RoleEnum::SUPER_ADMIN->value);
    }
}
