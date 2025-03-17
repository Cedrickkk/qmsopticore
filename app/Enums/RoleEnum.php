<?php

namespace App\Enums;


enum RoleEnum: string
{
    case SUPER_ADMIN = 'super_admin';
    case DEPARTMENT_ADMIN = 'department_admin';
    case REGULAR_USER = 'regular_user';

    public function permissions(): array
    {
        return match ($this) {
            self::SUPER_ADMIN => array_map(fn($case) => $case->value, PermissionEnum::cases()),

            self::DEPARTMENT_ADMIN => array_map(fn($case) => $case->value, [
                PermissionEnum::DOCUMENT_CREATE,
                PermissionEnum::DOCUMENT_VIEW,
                PermissionEnum::DOCUMENT_EDIT,
                PermissionEnum::DOCUMENT_DELETE,
                PermissionEnum::DOCUMENT_DOWNLOAD,
                PermissionEnum::DOCUMENT_REJECT,
                PermissionEnum::DOCUMENT_REVOKE_ACCESS,
                PermissionEnum::USER_VIEW
            ]),

            self::REGULAR_USER => array_map(fn($case) => $case->value, [
                PermissionEnum::DOCUMENT_CREATE,
                PermissionEnum::DOCUMENT_VIEW,
                PermissionEnum::DOCUMENT_DOWNLOAD,
            ])
        };
    }
}
