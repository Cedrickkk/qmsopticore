<?php

namespace App\Http\Controllers;

use App\Models\Backup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function index()
    {
        return Inertia::render('system-settings/backups', [
            'backups' => Backup::all(),
        ]);
    }
}
