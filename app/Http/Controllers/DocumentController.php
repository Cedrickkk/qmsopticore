<?php

namespace App\Http\Controllers;

use App\Enums\PermissionEnum;
use Inertia\Inertia;
use App\Models\Document;
use Illuminate\Http\Request;
use App\Services\DocumentService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreDocumentRequest;
use App\Services\DocumentPermissionService;
use App\Services\DocumentViewService;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService  $service,
        private readonly DocumentPermissionService $permissionService,
        private readonly DocumentViewService $documentViewService
    ) {}

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
            'permission' => [
                'canManageAccess' => Auth::user()->hasRole('super_admin') || Auth::user()->can(PermissionEnum::DOCUMENT_REVOKE_ACCESS->value)
            ]
        ]);
    }

    public function show(Document $document)
    {
        $viewData = $this->documentViewService->prepareDocumentForView($document, $this->service->getUser());

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
        $this->service->store($request);
    }


    public function history(Document $document)
    {
        return Inertia::render('documents/history', [
            'document' => $document,
            'workflowLogs' => $this->service->getDocumentHistoryLogs($document)
        ]);
    }

    public function archive(Document $document)
    {
        $this->service->archive($document);
    }

    public function approve(Document $document, Request $request,)
    {
        $this->service->approve($document,  $request->comment);
    }

    public function reject(Document $document, Request $request)
    {
        $this->service->reject($document, 'Test $reason', $request->comment);
    }
}
