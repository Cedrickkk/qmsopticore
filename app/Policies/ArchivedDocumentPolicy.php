<?php

namespace App\Policies;

use App\Enums\RoleEnum;
use App\Models\ArchivedDocument;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ArchivedDocumentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any archived documents.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view archives list
    }

    /**
     * Determine whether the user can view the archived document.
     */
    public function view(User $user, ArchivedDocument $archivedDocument): bool
    {
        // Delegate to the original document policy
        return $user->can('view', $archivedDocument->document);
    }

    /**
     * Determine whether the user can restore the archived document.
     */
    public function restore(User $user, ArchivedDocument $archivedDocument): bool
    {
        // Super admins can restore any document
        if ($user->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            return true;
        }

        // Document creators can restore their own documents
        if ($archivedDocument->document->created_by === $user->id) {
            return true;
        }

        // Department admins can restore documents from their department
        if ($user->hasRole(RoleEnum::DEPARTMENT_ADMIN->value)) {
            // Add department logic if needed
            return $this->isFromSameDepartment($user, $archivedDocument->document);
        }

        return false;
    }

    /**
     * Determine whether the user can permanently delete the archived document.
     */
    public function forceDelete(User $user, ArchivedDocument $archivedDocument): bool
    {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    /**
     * Check if document belongs to user's department
     */
    private function isFromSameDepartment(User $user, $document): bool
    {
        // Implement your department logic here
        return $user->department_id === $document->created_by_department_id;
    }
}
