<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Document;
use Illuminate\Http\Request;
use App\Services\DocumentService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreDocumentRequest;
use Illuminate\Support\Facades\Log;

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
        Gate::authorize('view', $document);

        $user = Auth::user();

        $filePath = Storage::url("documents/many_pages.pdf");

        $this->service->updateVersion($document, '5.0.1');

        $nextSignatory = $document->signatories
            ->where('status', 'pending')
            ->sortBy('signatory_order')
            ->first();

        $document->load([
            'createdBy:id,name',
            'category:id,name',
            'signatories' => function ($query) {
                $query->orderBy('signatory_order', 'asc')
                    ->select('id', 'document_id', 'user_id', 'status', 'signed_at', 'signatory_order');
            },
            'signatories.user:id,name,position,avatar'
        ]);

        return Inertia::render('documents/show', [
            'document' => $document,
            'file' => $filePath,
            'signatory' => $this->service->isSignatory($document, $user->id),
            'canSign' => $nextSignatory && $nextSignatory->user_id === $user->id,
            'isNextSignatory' => $nextSignatory ? [
                'order' => $nextSignatory->signatory_order,
                'name' => $nextSignatory->user->name
            ] : null
        ]);
    }

    public function store(StoreDocumentRequest $request)
    {
        $this->service->store($request);
    }


    public function history(Document $document)
    {
        $workflowLogs = $this->service->getDocumentHistoryLogs($document);

        return Inertia::render('documents/history', [
            'document' => $document,
            'workflowLogs' => $workflowLogs,
        ]);
    }

    public function archive(Document $document)
    {
        $this->service->archive($document);
    }
}
