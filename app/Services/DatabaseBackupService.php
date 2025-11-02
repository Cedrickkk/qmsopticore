<?php
// filepath: c:\Users\Cedric\Desktop\qmsopticore\app\Services\DatabaseBackupService.php

namespace App\Services;

use App\Models\Backup;
use Illuminate\Support\Facades\Auth;

class DatabaseBackupService
{
    protected string $backupDisk = 'backups';
    protected string $backupDirectory;

    public function __construct(private readonly FileService $fileService)
    {
        // Get the backup directory name from config (matches Spatie backup name)
        $this->backupDirectory = config('backup.backup.name', 'qmsopticore');
    }

    /**
     * Create a database backup using shell_exec
     */
    public function createBackup(): Backup
    {
        try {
            // Generate filename
            $filename = 'db_backup_' . now()->format('Y-m-d_His') . '.sql';

            // Use FileService to get full path
            $fullPath = $this->fileService->getPath($filename, $this->backupDirectory);
            $relativePath = $this->backupDirectory . '/' . $filename;

            // Ensure directory exists
            $directory = dirname($fullPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            // Get database credentials
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port', 3306);
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');

            // Build command based on OS
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $mysqldumpPath = config('database.connections.mysql.dump.dump_binary_path', 'C:\\xampp\\mysql\\bin');
                $command = sprintf(
                    '"%s\\mysqldump.exe" --user=%s --password=%s --host=%s --port=%s --skip-column-statistics %s > "%s" 2>&1',
                    $mysqldumpPath,
                    escapeshellarg($username),
                    escapeshellarg($password),
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($database),
                    $fullPath
                );
            } else {
                $command = sprintf(
                    'mysqldump --user=%s --password=%s --host=%s --port=%s --single-transaction --quick --lock-tables=false %s > %s 2>&1',
                    escapeshellarg($username),
                    escapeshellarg($password),
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($database),
                    escapeshellarg($fullPath)
                );
            }


            // Execute the command
            $output = shell_exec($command);

            // Wait for file to be written
            sleep(1);

            // Verify file exists using FileService
            if (!$this->fileService->exists($filename, $this->backupDirectory)) {
                throw new \Exception('Backup file was not created. Output: ' . $output);
            }

            $fileSize = filesize($fullPath);

            if ($fileSize === 0) {
                throw new \Exception('Backup file is empty. Output: ' . $output);
            }

            // Create backup record
            $backup = Backup::create([
                'user_id' => Auth::id(),
                'type' => 'database',
                'filename' => $filename,
                'path' => $relativePath,
                'size' => $fileSize,
                'successful' => true,
                'error_message' => null,
            ]);


            return $backup;
        } catch (\Exception $e) {

            $backup = Backup::create([
                'user_id' => Auth::id(),
                'type' => 'database',
                'filename' => $filename ?? '',
                'path' => $relativePath ?? '',
                'size' => 0,
                'successful' => false,
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Download a backup file
     */
    public function download(Backup $backup)
    {
        if (!$this->fileService->exists($backup->filename, $this->backupDirectory)) {
            throw new \Exception('Backup file not found: ' . $backup->filename);
        }

        return $this->fileService->download($backup->filename, $this->backupDirectory);
    }

    /**
     * Delete a backup
     */
    public function delete(Backup $backup): bool
    {
        // Delete file if it exists
        if ($this->fileService->exists($backup->filename, $this->backupDirectory)) {
            $fullPath = $this->fileService->getPath($backup->filename, $this->backupDirectory);
            unlink($fullPath);
        }

        // Delete database record
        return $backup->delete();
    }

    /**
     * Get all backups
     */
    public function getAllBackups()
    {
        return Backup::with('user')
            ->where('type', 'database')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Clean old backups
     */
    public function cleanOldBackups(): void
    {
        $cutoffDate = now()->subDays(7);

        $oldBackups = Backup::where('type', 'database')
            ->where('created_at', '<', $cutoffDate)
            ->get();

        foreach ($oldBackups as $backup) {
            $this->delete($backup);
        }
    }

    /**
     * Get backup file size in human readable format
     */
    public function getFileSize(Backup $backup): string
    {
        if (!$this->fileService->exists($backup->filename, $this->backupDirectory)) {
            return 'File not found';
        }

        $fullPath = $this->fileService->getPath($backup->filename, $this->backupDirectory);
        $bytes = filesize($fullPath);

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Verify backup integrity
     */
    public function verifyBackup(Backup $backup): bool
    {
        if (!$this->fileService->exists($backup->filename, $this->backupDirectory)) {
            return false;
        }

        $fullPath = $this->fileService->getPath($backup->filename, $this->backupDirectory);
        $fileSize = filesize($fullPath);

        // Check if file size matches database record
        if ($fileSize !== $backup->size) {

            return false;
        }

        // Check if file is empty
        if ($fileSize === 0) {
            return false;
        }

        return true;
    }

    /**
     * Get backup file URL (if public)
     */
    public function getBackupUrl(Backup $backup): ?string
    {
        if (!$this->fileService->exists($backup->filename, $this->backupDirectory)) {
            return null;
        }

        return $this->fileService->getUrlPath($backup->filename, $this->backupDirectory);
    }

    public function getPaginatedBackups(int $perPage = 10)
    {
        return Backup::with('user')
            ->where('type', 'database')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
