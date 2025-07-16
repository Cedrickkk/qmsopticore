<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLogService
    ) {}

    public function index(Request $request)
    {
        $logs = $this->activityLogService->getPaginatedLogs(
            search: $request->search,
            action: $request->action,
            entityType: $request->entity_type,
            userId: $request->user_id,
            dateFrom: $request->date_from,
            dateTo: $request->date_to,
            perPage: $request->per_page ?? 10
        );

        $stats = $this->activityLogService->getActivityStats();

        return Inertia::render('system-settings/logs', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'action' => $request->action,
                'entity_type' => $request->entity_type,
                'user_id' => $request->user_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }
}
