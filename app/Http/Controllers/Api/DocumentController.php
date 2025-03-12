<?php

namespace App\Http\Controllers\Api;

use App\Models\Document;
use App\Services\DocumentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;

class DocumentController extends Controller
{

    public function __construct(protected readonly DocumentService $service) {}

    public function download(Document $document)
    {
        if (!$this->service->documentExists($document)) {
            return response()->json([
                'error' => 'Document file not found.'
            ], 404);
        }

        return $this->service->download($document);
    }
}
