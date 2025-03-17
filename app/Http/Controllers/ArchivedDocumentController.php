<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Services\DocumentService;

class ArchivedDocumentController extends Controller
{

    public function __construct(private readonly DocumentService $service) {}

    public function index(Request $request)
    {
        return Inertia::render('archives', [
            'archives' => $this->service->getPaginatedArchivedDocuments($request->search),
        ]);
    }
}
