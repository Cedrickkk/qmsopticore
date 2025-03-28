<?php

namespace App\Http\Controllers;

use App\Services\DocumentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{

    public function __construct(private readonly DocumentService $service) {}

    public function index()
    {
        /**
         * TODO: Update the system settings 
         */
        return Inertia::render('system-settings', [
            'options' => $this->service->getDocumentCreationOptions()
        ]);
    }
}
