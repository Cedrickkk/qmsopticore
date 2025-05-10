<?php

namespace App\Http\Controllers\Documents;

use Inertia\Inertia;
use App\Models\Document;
use Illuminate\Http\Request;
use App\Enums\PermissionEnum;
use App\Services\DocumentService;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Services\DocumentViewService;
use App\Http\Requests\StoreDocumentRequest;
use App\Services\DocumentPermissionService;
use Illuminate\Support\Facades\Gate;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService  $documentService,
        private readonly DocumentPermissionService $permissionService,
        private readonly DocumentViewService $documentViewService
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('documents', [
            'documents' => $this->documentService->getPaginatedDocuments($request->search),
        ]);
    }

    public function create()
    {
        return Inertia::render('documents/create', [
            'options' => $this->documentService->getDocumentCreationOptions(),
            'permission' => [
                'canManageAccess' => Auth::user()->hasRole('super_admin') || Auth::user()->can(PermissionEnum::DOCUMENT_REVOKE_ACCESS->value)
            ]
        ]);
    }

    public function show(Document $document)
    {
        $viewData = $this->documentViewService->prepareDocumentForView($document, $this->documentService->getUser());

        return Inertia::render('documents/show', [
            'document' => $viewData['document'],
            'file' => $viewData['file'],
            'canSign' => $viewData['canSign'],
            'signatures' => $viewData['signatures'],
            'isNextSignatory' => $viewData['isNextSignatory']
        ]);
    }

    public function store(StoreDocumentRequest $request)
    {
        $this->documentService->store($request);
    }


    public function history(Document $document)
    {
        Gate::authorize('view', $document);

        return Inertia::render('documents/history', [
            'document' => $document,
            'workflowLogs' => $this->documentService->getDocumentHistoryLogs($document)
        ]);
    }

    public function archive(Document $document)
    {
        $this->documentService->archive($document);
    }

    public function approve(Document $document, Request $request,)
    {
        $this->documentService->approve($document,  $request->comment);
    }

    public function reject(Document $document, Request $request)
    {
        $this->documentService->reject($document, 'Test reason', $request->comment);
    }
}
