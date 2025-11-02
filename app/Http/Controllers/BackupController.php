<?php

namespace App\Http\Controllers;

use App\Models\Backup;
use App\Services\ActivityLogService;
use App\Services\DatabaseBackupService;
use App\Services\DocumentBackupService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function __construct(
        protected ActivityLogService $activityLogService,
        protected DatabaseBackupService $databaseBackupService,
        protected DocumentBackupService $documentBackupService
    ) {}

    public function index()
    {
        $backups = Backup::with('user')
            ->whereIn('type', ['database', 'document'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('system-settings/backups', [
            'backups' => $backups,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $backup = $this->databaseBackupService->createBackup();

            $this->activityLogService->logBackup('created', $backup);

            return response()->json([
                'success' => true,
                'message' => 'Database backup created successfully!',
            ]);
        } catch (\Exception $e) {
            $this->activityLogService->logSystem(
                action: 'backup_failed',
                description: 'Failed to create database backup: ' . $e->getMessage(),
                metadata: ['type' => 'database', 'error' => $e->getMessage()]
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to create backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function storeDocumentBackup(Request $request)
    {
        try {
            $backup = $this->documentBackupService->createBackup();

            $this->activityLogService->logBackup('created', $backup);

            return response()->json([
                'success' => true,
                'message' => 'Document backup created successfully!',
            ]);
        } catch (\Exception $e) {
            $this->activityLogService->logSystem(
                action: 'backup_failed',
                description: 'Failed to create document backup: ' . $e->getMessage(),
                metadata: ['type' => 'document', 'error' => $e->getMessage()]
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to create document backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function download(Backup $backup)
    {
        try {
            $this->activityLogService->logBackup('downloaded', $backup);

            if ($backup->type === 'database') {
                return $this->databaseBackupService->download($backup);
            } else {
                return $this->documentBackupService->download($backup);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Backup $backup)
    {
        try {
            $backupInfo = [
                'filename' => $backup->filename,
                'type' => $backup->type,
                'size' => $backup->file_size,
            ];

            if ($backup->type === 'database') {
                $this->databaseBackupService->delete($backup);
            } else {
                $this->documentBackupService->delete($backup);
            }

            $this->activityLogService->logSystem(
                action: 'deleted',
                description: "Backup '{$backupInfo['filename']}' ({$backupInfo['type']}) was deleted",
                metadata: $backupInfo
            );

            return response()->json([
                'success' => true,
                'message' => 'Backup deleted successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function clean()
    {
        try {
            $this->databaseBackupService->cleanOldBackups();
            $this->documentBackupService->cleanOldBackups();

            $this->activityLogService->logSystem(
                action: 'backups_cleaned',
                description: 'Old backups were cleaned up (database and document backups older than retention period)',
                metadata: [
                    'database_retention_days' => 7,
                    'document_retention_days' => 30,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Old backups cleaned successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clean backups: ' . $e->getMessage(),
            ], 500);
        }
    }
}
