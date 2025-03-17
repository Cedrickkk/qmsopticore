<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Enums\PermissionEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (RoleEnum::cases() as $role) {
            Role::create(['name' => $role->value]);
        }

        foreach (PermissionEnum::cases() as $permission) {
            Permission::create(['name' => $permission->value]);
        }

        $superAdmin = Role::where('name', RoleEnum::SUPER_ADMIN->value)->first();

        $departmentAdmin = Role::where('name', RoleEnum::DEPARTMENT_ADMIN->value)->first();

        $regularUser = Role::where('name', RoleEnum::REGULAR_USER->value)->first();

        $superAdmin->syncPermissions(Permission::all());

        $departmentAdmin->syncPermissions(RoleEnum::DEPARTMENT_ADMIN->permissions());

        $regularUser->syncPermissions(RoleEnum::REGULAR_USER->permissions());
    }
}
