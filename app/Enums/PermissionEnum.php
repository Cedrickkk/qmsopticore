<?php

namespace App\Enums;

enum PermissionEnum: string
{

/**
     * 
     * Document Permissions
     * 
     */

    case DOCUMENT_CREATE = 'document:create';
    case DOCUMENT_VIEW = 'document:view';
    case DOCUMENT_EDIT = 'document:edit';
    case DOCUMENT_DELETE = 'document:delete';
    case DOCUMENT_DOWNLOAD = 'document:download';
    case DOCUMENT_SIGN = 'document:sign';
    case DOCUMENT_REJECT = 'document:reject';
    case DOCUMENT_ARCHIVE = 'document:archive';
    case DOCUMENT_REVOKE_ACCESS = 'document:revoke_access';

/**
     * 
     * User Permissions
     * 
     */

    case USER_CREATE = 'user:create';
    case USER_VIEW = 'user:view';
    case USER_EDIT = 'user:edit';
    case USER_DELETE = 'user:delete';

/**
     * 
     * Department Permissions
     * 
     */

    case DEPARTMENT_CREATE = 'department:create';
    case DEPARTMENT_VIEW = 'department:view';
    case DEPARTMENT_EDIT = 'department:edit';
    case DEPARTMENT_DELETE = 'department:delete';
}
