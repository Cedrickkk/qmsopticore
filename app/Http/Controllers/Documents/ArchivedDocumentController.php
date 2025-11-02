<?php

namespace App\Http\Controllers\Documents;

use Inertia\Inertia;
use App\Models\Document;
use Illuminate\Http\Request;
use App\Services\DocumentService;
use App\Http\Controllers\Controller;
use App\Models\ArchivedDocument;
use App\Services\ActivityLogService;
use App\Services\DocumentAccessPermissionService;
use App\Services\DocumentViewService;
use App\Services\UserService;
use App\Services\WorkflowService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ArchivedDocumentController extends Controller
{

    public function __construct(
        private readonly DocumentService $documentService,
        private readonly ActivityLogService $activityLogService,
        private readonly DocumentViewService $documentViewService,
        private readonly UserService $userService,
        private readonly DocumentAccessPermissionService $documentAccessPermissionService,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('archives', [
            'archives' => $this->documentService->getPaginatedArchivedDocuments(
                $request->search,
                $request->date_from,
                $request->date_to
            )
        ]);
    }

    public function show(ArchivedDocument $archivedDocument)
    {
        $this->activityLogService->logDocument('viewed', $archivedDocument);

        $archivedDocument->load([
            'document.category',
            'document.createdBy',
            'document.signatories.user',
            'document.recipients.user',
            'archivedBy'
        ]);

        $viewData = $this->documentViewService->prepareDocumentForView($archivedDocument->document, $this->userService->getUser());

        return Inertia::render('archives/show', [
            'file' => $viewData['file'],
            'archivedDocument' => $archivedDocument,
            'workflowLogs' => $this->documentService->getDocumentHistoryLogs($archivedDocument->document),
            'canRestore' => Gate::allows('restore', $archivedDocument->document),
            'accessPermissions' => $this->documentAccessPermissionService->getUserPermissionsSummary(
                $archivedDocument->document,
                Auth::user()
            ),
        ]);
    }

    public function archive(Document $document, Request $request)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        $this->documentService->archive(
            $document,
            Auth::id(),
            $request->input('reason') ?? 'Manual archive'
        );

        $this->activityLogService->logDocument('archived', $document, [
            'archived_by' => Auth::user()->name,
            'reason' => $request->input('reason') ?? 'Manual archive'
        ]);
    }

    public function unarchive(ArchivedDocument $archivedDocument)
    {
        $this->activityLogService->logDocument('unarchived', $archivedDocument);

        $this->documentService->unarchive($archivedDocument, Auth::id());
    }
}
