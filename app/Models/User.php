<?php

namespace App\Models;

use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'position',
        'department_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function documentPermissions(): HasMany
    {
        return $this->hasMany(DocumentPermission::class);
    }

    public function authorizedDocuments()
    {
        return Document::whereHas('permission', function ($query) {
            $query->where('user_id', $this->id)
                ->where('can_view', true);
        })->orWhere('created_by', $this->id);
    }

    public function signatures()
    {
        return $this->hasMany(Signature::class);
    }

    // TODO: This shouldnt b here, make this into user repository or user service class
    public function getSignatures(): array
    {
        $signatureFilePaths = [];

        $signatures = $this->signatures()->get(['file_name']);

        foreach ($signatures as $signature) {
            $signatureFilePaths[] = Storage::url("signatures/{$signature->file_name}");
        }

        return $signatureFilePaths;
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
