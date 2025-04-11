<?php

namespace App\Http\Controllers\Documents;

use Inertia\Inertia;
use App\Models\Document;
use Illuminate\Http\Request;
use App\Services\DocumentService;
use App\Http\Controllers\Controller;

class ArchivedDocumentController extends Controller
{

    public function __construct(private readonly DocumentService $service) {}

    public function index(Request $request)
    {
        return Inertia::render('archives', [
            'archives' => $this->service->getPaginatedArchivedDocuments($request->search),
        ]);
    }

    public function unarchive(Document $document)
    {
        return $this->service->unarchive($document);
    }
}
