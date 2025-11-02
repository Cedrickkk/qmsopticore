<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\Document;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DocumentPolicy
{
    use HandlesAuthorization;

    public function __construct() {}

    /**
     * Determine whether the user can view any documents.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view documents list
    }

    /**
     * Determine whether the user can view the document.
     */
    public function view(User $user, Document $document): bool
    {
        // Super admins can view all documents
        if ($user->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            return true;
        }

        // Department admins can view their department's documents
        if ($user->hasRole(RoleEnum::DEPARTMENT_ADMIN->value)) {
            // Add department check logic here if needed
            return true;
        }

        // Users can view documents they created
        if ($document->created_by === $user->id) {
            return true;
        }

        // Users can view documents they are signatories for
        if ($document->signatories()->where('user_id', $user->id)->exists()) {
            return true;
        }

        // Users can view documents they are representatives for
        if ($document->signatories()->where('representative_user_id', $user->id)->exists()) {
            return true;
        }

        // Users can view documents they are recipients for
        if ($document->recipients()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create documents.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::DEPARTMENT_ADMIN->value,
        ]) || $user->hasPermissionTo(PermissionEnum::DOCUMENT_CREATE->value);
    }

    /**
     * Determine whether the user can update the document.
     */
    public function update(User $user, Document $document): bool
    {
        // Only document creator or super admin can update
        if ($user->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            return true;
        }

        return $document->created_by === $user->id &&
            ! in_array($document->status, ['approved', 'published', 'archived']);
    }

    /**
     * Determine whether the user can delete the document.
     */
    public function delete(User $user, Document $document): bool
    {
        // Only super admin can delete documents
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    /**
     * Determine whether the user can approve the document.
     */
    public function approve(User $user, Document $document): bool
    {
        if ($document->status !== 'in_review') {
            return false;
        }

        $nextSignatory = $document->signatories()
            ->where('status', 'pending')
            ->orderBy('signatory_order')
            ->first();

        if (!$nextSignatory) {
            return false;
        }

        // Check if user is the signatory OR the representative
        return $nextSignatory->user_id === $user->id ||
            $nextSignatory->representative_user_id === $user->id;
    }

    /**
     * Determine whether the user can reject the document.
     */
    public function reject(User $user, Document $document): bool
    {
        return $this->approve($user, $document);
    }

    /**
     * Determine whether the user can archive the document.
     */
    public function archive(User $user, Document $document): bool
    {
        if (! in_array($document->status, ['approved', 'published'])) {
            return false;
        }

        return $user->hasRole(RoleEnum::SUPER_ADMIN->value) ||
            $document->created_by === $user->id;
    }

    /**
     * Determine whether the user can restore the document.
     */
    public function restore(User $user, Document $document): bool
    {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    /**
     * Determine whether the user can permanently delete the document.
     */
    public function forceDelete(User $user, Document $document): bool
    {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    /**
     * Determine if the user can manage permissions.
     * Only document owners and admins can manage permissions.
     */
    public function managePermissions(User $user, Document $document): bool
    {
        return $document->created_by === $user->id || $user->hasRole('admin');
    }
}
