<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Faker\Factory;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{

    private $faker;

    public function __construct()
    {
        $this->faker = Factory::create();
    }
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'User Test',
            'email' => 'user@plpasig.edu.ph',
            'email_verified_at' => now(),
            'avatar' => $this->faker->imageUrl(640, 480, 'people'),
            'password' => 'user12345',
            'position' => 'Office Staff',
            'remember_token' => Str::random(10),
        ])->assignRole(RoleEnum::REGULAR_USER->value);

        User::create([
            'name' => 'Admin Test',
            'email' => 'admin@plpasig.edu.ph',
            'avatar' => $this->faker->imageUrl(640, 480, 'people'),
            'email_verified_at' => now(),
            'position' => 'System Administrator',
            'password' => 'admin12345',
            'remember_token' => Str::random(10),
        ])->assignRole(RoleEnum::SUPER_ADMIN->value);

        User::factory(5)->create();
    }
}
