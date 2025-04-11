<?php

namespace App\Http\Controllers\Settings;

use Inertia\Inertia;
use App\Services\DocumentService;
use App\Http\Controllers\Controller;

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
