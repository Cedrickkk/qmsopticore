<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Services\ActivityLogService;
use App\Services\DocumentAccessPermissionService;
use App\Services\DocumentService;
use App\Services\DocumentViewService;
use App\Services\FileService;
use App\Services\PdfService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly UserService $userService,
        private readonly DocumentAccessPermissionService $documentAccessPermissionService,
        private readonly DocumentViewService $documentViewService,
        private readonly ActivityLogService $activityLogService,
        private readonly PdfService $pdfService,
        private readonly FileService $fileService,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('documents', [
            'documents' => $this->documentService->getPaginatedDocuments(
                $request->search,
                $request->date_from,
                $request->date_to
            )
        ]);
    }

    public function create()
    {
        return Inertia::render('documents/create', [
            'options' => $this->documentService->getDocumentCreationOptions(),
        ]);
    }

    public function show(Document $document)
    {
        $this->activityLogService->logDocument('viewed', $document);

        $viewData = $this->documentViewService->prepareDocumentForView($document, $this->userService->getUser());

        return Inertia::render('documents/show', [
            'document' => $viewData['document'],
            'file' => $viewData['file'],
            'canSign' => $viewData['canSign'],
            'signatures' => $viewData['signatures'],
            'nextSignatory' => $viewData['nextSignatory'],
            'accessPermissions' => $this->documentAccessPermissionService->getUserPermissionsSummary($document, Auth::user()),
            'workflowLogs' => $this->documentService->getDocumentHistoryLogs($document),
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
            'workflowLogs' => $this->documentService->getDocumentHistoryLogs($document),
        ]);
    }

    public function archive(Document $document)
    {
        $this->documentService->archive($document);

        $this->activityLogService->logDocument('archived', $document);
    }

    public function approve(Document $document, Request $request)
    {
        $this->documentService->approve($document, $request->comment);

        $this->activityLogService->logDocument('approved', $document);
    }

    public function reject(Document $document, Request $request)
    {
        $this->documentService->reject($document, 'Test reason', $request->comment);

        $this->activityLogService->logDocument('rejected', $document);
    }
}
