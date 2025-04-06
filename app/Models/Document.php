<?php

namespace App\Models;

use App\Enums\PermissionEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Document extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'title',
        'created_by',
        'status',
        'category',
        'version',
        'description'
    ];


    /**
     * Get the category of the document.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category');
    }

    /**
     * Get the creator of the document.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(DocumentRecipient::class);
    }

    /**
     * Get the signatories for the document.
     */
    public function signatories(): HasMany
    {
        return $this->hasMany(DocumentSignatory::class, 'document_id', 'id');
    }

    /**
     * Get the workflow logs for the document.
     */
    public function workflowLogs(): HasMany
    {
        return $this->hasMany(DocumentWorkflowLog::class);
    }

    public function archivedDocument()
    {
        return $this->hasOne(ArchivedDocument::class);
    }

    public function permissions()
    {
        return $this->hasMany(DocumentPermission::class);
    }

    public function hasUserPermission(User $user, string $permission)
    {
        $permissionMap = [
            'view' => 'can_view',
            'edit' => 'can_edit',
            'download' => 'can_downlaod',
            'share' => 'can_share',
        ];

        $permissionField = $permissionMap[$permission] ?? null;

        if (!$permissionField) {
            return false;
        }

        if ($this->createdBy->id === $user->id) {
            return true;
        }

        $userPermission = $this->permissions()->where('user_id', $user->id)->first();

        if ($userPermission && $userPermission->{$permissionField}) {
            return true;
        }

        $permissionEnumMap = [
            'view' => PermissionEnum::DOCUMENT_VIEW->value,
            'edit' => PermissionEnum::DOCUMENT_EDIT->value,
            'download' => PermissionEnum::DOCUMENT_DOWNLOAD->value,
            'sign' => PermissionEnum::DOCUMENT_SIGN->value,
            'reject' => PermissionEnum::DOCUMENT_REJECT->value,
            'archive' => PermissionEnum::DOCUMENT_ARCHIVE->value,
            'revoke_access' => PermissionEnum::DOCUMENT_REVOKE_ACCESS->value,
            'share' => PermissionEnum::DOCUMENT_REVOKE_ACCESS->value, // Using revoke_access as a proxy for share
        ];

        $enumPermission = $permissionEnumMap[$permission] ?? null;

        return $enumPermission && $user->hasPermissionTo($enumPermission);
    }
}
