<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArchivedDocument extends Model
{

    protected $fillable = [
        'document_id',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
