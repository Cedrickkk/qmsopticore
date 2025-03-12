<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Document;
use Illuminate\Http\Request;
use App\Services\DocumentService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreDocumentRequest;

class DocumentController extends Controller
{
    public function __construct(private readonly DocumentService  $service) {}

    public function index(Request $request)
    {
        return Inertia::render('documents', [
            'documents' => $this->service->getPaginatedDocuments($request->search),
        ]);
    }

    public function create()
    {
        return Inertia::render('documents/create', [
            'options' => $this->service->getDocumentCreationOptions(),
        ]);
    }

    public function show(Document $document)
    {
        $user = Auth::user();

        $filePath = Storage::url("documents/sample_document.pdf");

        return Inertia::render('documents/show', [
            'document' => $document->load(['creator:id,name', 'category:id,name']),
            'file' => $filePath,
            'signatory' => $this->service->isSignatory($document, $user->id),
        ]);
    }

    public function store(StoreDocumentRequest $request) {}


    public function history()
    {
        dd("Iam here");
    }
}
