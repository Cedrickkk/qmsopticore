<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRecipient extends Model
{
    protected $fillable = [
        'document_id',
        'user_id',
    ];
}
