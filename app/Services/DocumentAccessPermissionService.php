<?php

namespace App\Services;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\Document;
use App\Models\User;

class DocumentAccessPermissionService
{
  /**
   * Check if a user can manage document access permissions
   */
  public function canManageDocumentAccess(Document $document, User $user): bool
  {
    // Super admin can manage all documents
    if ($user->hasRole(RoleEnum::SUPER_ADMIN->value)) {
      return true;
    }

    // Document owner can manage access
    if ($document->created_by === $user->id) {
      return true;
    }

    // Users with explicit document manage access permission
    if ($user->hasPermissionTo(PermissionEnum::DOCUMENT_MANAGE_ACCESS->value)) {
      return true;
    }

    // Department admin can manage documents from their department
    if ($user->hasRole(RoleEnum::DEPARTMENT_ADMIN->value)) {
      // Check if document creator is from same department
      if ($document->createdBy && $document->createdBy->department_id === $user->department_id) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a user can revoke access from other users
   */
  public function canRevokeDocumentAccess(Document $document, User $user): bool
  {
    // Super admin can revoke any access
    if ($user->hasRole(RoleEnum::SUPER_ADMIN->value)) {
      return true;
    }

    // Document owner can revoke access
    if ($document->created_by === $user->id) {
      return true;
    }

    // Users with explicit revoke access permission
    if ($user->hasPermissionTo(PermissionEnum::DOCUMENT_REVOKE_ACCESS->value)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a user can modify permissions for a specific user
   */
  public function canModifyUserPermissions(Document $document, User $currentUser, User $targetUser): bool
  {
    // Can't modify your own permissions
    if ($currentUser->id === $targetUser->id) {
      return false;
    }

    // Must have manage access permission first
    if (! $this->canManageDocumentAccess($document, $currentUser)) {
      return false;
    }

    // Super admin can modify anyone's permissions
    if ($currentUser->hasRole(RoleEnum::SUPER_ADMIN->value)) {
      return true;
    }

    // Document owner can modify anyone's permissions except super admins
    if ($document->created_by === $currentUser->id) {
      return ! $targetUser->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    // Department admin can only modify permissions for users in their department
    if ($currentUser->hasRole(RoleEnum::DEPARTMENT_ADMIN->value)) {
      return $targetUser->department_id === $currentUser->department_id &&
        ! $targetUser->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    return false;
  }

  /**
   * Get user permissions summary for document access management
   */
  public function getUserPermissionsSummary(Document $document, User $user): array
  {
    return [
      'canManageAccess' => $this->canManageDocumentAccess($document, $user),
      'canRevokeAccess' => $this->canRevokeDocumentAccess($document, $user),
      'isDocumentOwner' => $document->created_by === $user->id,
      'isSuperAdmin' => $user->hasRole(RoleEnum::SUPER_ADMIN->value),
      'isDepartmentAdmin' => $user->hasRole(RoleEnum::DEPARTMENT_ADMIN->value),
    ];
  }
}
