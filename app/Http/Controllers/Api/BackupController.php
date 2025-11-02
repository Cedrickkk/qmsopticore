<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use App\Services\DatabaseBackupService;
use App\Services\DocumentBackupService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
  public function __construct(
    protected DatabaseBackupService $databaseBackupService,
    protected DocumentBackupService $documentBackupService,
  ) {}

  /**
   * Download a backup file
   */
  public function download(Backup $backup): BinaryFileResponse|JsonResponse
  {
    try {
      $fullPath = storage_path("app/private/{$backup->path}");

      if (!file_exists($fullPath)) {
        return response()->json([
          'error' => 'Backup file not found.'
        ], 404);
      }

      if (!$backup->successful) {
        return response()->json([
          'error' => 'This backup was not successful and cannot be downloaded.'
        ], 400);
      }

      return response()->download($fullPath, $backup->filename, [
        'Content-Type' => 'application/sql',
        'Content-Disposition' => 'attachment; filename="' . $backup->filename . '"',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'error' => 'Failed to download backup: ' . $e->getMessage()
      ], 500);
    }
  }
}
