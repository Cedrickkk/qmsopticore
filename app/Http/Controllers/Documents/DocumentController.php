<?php

namespace App\Http\Controllers\Documents;

use App\Contracts\Repositories\DocumentRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\DocumentAccessPermissionService;
use App\Services\DocumentService;
use App\Services\DocumentViewService;
use App\Services\FileService;
use App\Services\PdfService;
use App\Services\UserService;
use App\Services\WorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
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
        private readonly DocumentRepositoryInterface $documentRepositoryInterface,
        private readonly WorkflowService $workflowService,
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
        if ($document->requiresReauth()) {
            $sessionKey = 'document_auth_' . $document->id;
            $lastAuth = session($sessionKey);

            if (!$lastAuth || now()->diffInMinutes($lastAuth) > 5) {
                return redirect()->route('documents.authenticate', $document);
            }
        }

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

    public function showAuthForm(Document $document)
    {
        return inertia('documents/authenticate', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'code' => $document->code,
                'confidentiality_level' => $document->confidentiality_level,
            ],
        ]);
    }

    public function authenticate(Request $request, Document $document)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            return back()->withErrors([
                'password' => 'The provided password is incorrect.',
            ]);
        }

        session(['document_auth_' . $document->id => now()]);

        return redirect()->route('documents.show', $document);
    }

    public function verifyAccess(Request $request, Document $document)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            return back()->withErrors([
                'password' => 'The provided password is incorrect.',
            ]);
        }

        session(['document_auth_' . $document->id => now()]);

        return back()->with('success', 'Access verified');
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

    public function setRepresentative(Request $request, Document $document)
    {
        $request->validate([
            'representative_user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();

        $signatory = $document->signatories()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$signatory) {
            return back()->with('error', 'You are not a pending signatory of this document');
        }

        $representative = User::find($request->representative_user_id);

        if ($this->documentRepositoryInterface->setRepresentative($signatory, $representative)) {
            $this->workflowService->log(
                $document,
                $user,
                'representative_assigned',
                $document->status,
                $document->status,
                "Assigned {$representative->name} as representative"
            );

            return back()->with('success', "Successfully assigned {$representative->name} as your representative");
        }

        return back()->with('error', 'Failed to assign representative');
    }

    public function removeRepresentative(Document $document)
    {
        $user = Auth::user();

        $signatory = $document->signatories()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$signatory) {
            return back()->with('error', 'You are not a pending signatory of this document');
        }

        $representativeName = $signatory->representative_name ?? 'Representative';

        if ($this->documentRepositoryInterface->removeRepresentative($signatory)) {
            $this->workflowService->log(
                $document,
                $user,
                'representative_removed',
                $document->status,
                $document->status,
                "Removed {$representativeName} as representative"
            );

            return back()->with('success', 'Representative removed successfully');
        }

        return back()->with('error', 'Failed to remove representative');
    }
}
