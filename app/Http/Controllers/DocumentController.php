<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService  $service) {}

    public function index(Request $request)
    {
        $query = Document::query()
            ->with('creator:id,name')
            ->with('category:id,name');

        if ($request->has('search') && $request->search !== null) {
            $search = $request->search;
            $query->where('title', 'like', "{$search}");
        }

        $documents = $query->paginate(10)->appends($request->all());

        return Inertia::render('documents', [
            'documents' => $documents,
        ]);
    }

    public function show(Document $document)
    {
        $user = Auth::user();

        $filePath = Storage::url("documents/many_pages.pdf");

        return Inertia::render('documents/show', [
            'document' => $document,
            'file' => $filePath,
            'signatory' => $this->service->isSignatory($document, $user->id),
        ]);
    }
}
