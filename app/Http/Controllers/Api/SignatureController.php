<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\SignatureValidationService;
use Illuminate\Support\Facades\Log;

class SignatureController extends Controller
{
    public function __construct(private readonly SignatureValidationService $service) {}

    public function validate(Request $request)
    {

        Log::info($request->file('signatures'));

        if (!$request->hasFile('signatures')) {
            return response()->json([
                'error' => 'No signature files provided'
            ], 400);
        }

        $signatures = $request->file('signatures');
        $paths = [];

        foreach ($signatures as $signature) {
            $path = $signature->store('temp/signatures');
            $paths[] = storage_path('app/' . $path);
        }

        $result = $this->service->validateSignatures($paths);

        foreach ($paths as $path) {
            if (file_exists($path)) {
                unlink($path);
            }
        }

        return response()->json($result);
    }
}
