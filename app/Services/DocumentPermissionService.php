<?php

namespace App\Services;

use App\Enums\PermissionEnum;
use App\Models\Document;
use App\Models\DocumentPermission;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DocumentPermissionService
{
    protected $permissionFieldMap = [
        'view' => 'can_view',
        'edit' => 'can_edit',
        'download' => 'can_download',
        'share' => 'can_share',
    ];

    protected $permissionEnumMap = [
        'view' => PermissionEnum::DOCUMENT_VIEW,
        'edit' => PermissionEnum::DOCUMENT_EDIT,
        'download' => PermissionEnum::DOCUMENT_DOWNLOAD,
        'share' => PermissionEnum::DOCUMENT_REVOKE_ACCESS,
    ];

    public function updatePermissions(Document $document, array $userPermissions): bool
    {
        DB::beginTransaction();

        try {
            // Remove any permissions not in the new list
            $currentUserIds = array_keys($userPermissions);
            $document->permissions()
                ->whereNotIn('user_id', $currentUserIds)
                ->delete();

            // Update or create permissions for each user
            foreach ($userPermissions as $userId => $permissions) {
                DocumentPermission::updateOrCreate(
                    [
                        'document_id' => $document->id,
                        'user_id' => $userId,
                    ],
                    [
                        'can_view' => $permissions['view'] ?? false,
                        'can_edit' => $permissions['edit'] ?? false,
                        'can_download' => $permissions['download'] ?? false,
                        'can_share' => $permissions['share'] ?? false,
                    ]
                );
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            return false;
        }
    }

    public function getUsersWithPermissions(Document $document): Collection
    {
        // Get all permissions for this document
        $permissions = DocumentPermission::with('user')
            ->where('document_id', $document->id)
            ->get();

        return $permissions->map(function ($permission) {
            return [
                'user' => $permission->user,
                'permissions' => [
                    'view' => $permission->can_view,
                    'edit' => $permission->can_edit,
                    'download' => $permission->can_download,
                    'share' => $permission->can_share,
                ],
            ];
        });
    }

    public function canUserAccess(Document $document, User $user, string $permission): bool
    {
        // Document owner has all permissions
        if ($document->created_by === $user->id) {
            return true;
        }

        // Admin role has all permissions
        if ($user->hasRole('admin')) {
            return true;
        }

        // First check document-specific permission
        $permissionField = $this->permissionFieldMap[$permission] ?? null;

        if ($permissionField) {
            $userPermission = DocumentPermission::where('document_id', $document->id)
                ->where('user_id', $user->id)
                ->first();

            if ($userPermission && $userPermission->{$permissionField}) {
                return true;
            }
        }

        // Then check global permission from enum
        $enumPermission = $this->permissionEnumMap[$permission] ?? null;
        return $enumPermission && $user->hasPermissionTo($enumPermission->value);
    }
}
