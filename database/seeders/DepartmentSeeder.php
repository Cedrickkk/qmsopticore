<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Enums\DepartmentEnum;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (DepartmentEnum::cases() as $department) {
            Department::firstOrCreate(
                ['name' => $department->label()]
            );
        }
    }
}
