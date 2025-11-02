<?php
// filepath: c:\Users\Cedric\Desktop\qmsopticore\app\Services\DocumentBackupService.php

namespace App\Services;

use App\Models\Backup;
use App\Models\Document;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DocumentBackupService
{
    protected string $backupDisk = 'backups';
    protected string $backupDirectory;

    public function __construct(private readonly FileService $fileService)
    {
        $this->backupDirectory = config('backup.backup.name', 'qmsopticore');
    }

    /**
     * Create a backup of all documents
     */
    public function createBackup(): Backup
    {
        try {
            $filename = 'documents_backup_' . now()->format('Y-m-d_His') . '.zip';
            $relativePath = $this->backupDirectory . '/' . $filename;

            $fullPath = Storage::disk($this->backupDisk)->path($relativePath);

            $directory = dirname($fullPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            // Get all documents with relationships - eager load department through creator
            $documents = Document::with(['createdBy.department', 'category'])
                ->where('status', '!=', 'archived')
                ->get();

            if ($documents->isEmpty()) {
                throw new \Exception('No documents found to backup');
            }

            $zip = new ZipArchive();
            $zipStatus = $zip->open($fullPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

            if ($zipStatus !== true) {
                throw new \Exception('Failed to create ZIP file. Error code: ' . $zipStatus);
            }

            $addedFiles = 0;
            $missingFiles = [];
            $skippedFiles = [];

            foreach ($documents as $document) {
                $documentPath = Storage::path('documents/' . $document->filename);

                if (file_exists($documentPath)) {
                    try {
                        $zipPath = $this->getZipPath($document);

                        // Debug: Check if path is being generated
                        if (empty($zipPath)) {
                            throw new \Exception('Empty ZIP path generated for document: ' . $document->code);
                        }

                        // Check if path is too long (Windows MAX_PATH is 260 chars)
                        if (strlen($fullPath . '/' . $zipPath) > 250) {
                            $zipPath = $this->getShortenedZipPath($document);
                        }

                        $result = $zip->addFile($documentPath, $zipPath);

                        if (!$result) {
                            $skippedFiles[] = [
                                'filename' => $document->filename,
                                'code' => $document->code,
                                'zip_path' => $zipPath,
                                'reason' => 'ZipArchive::addFile returned false',
                            ];
                        } else {
                            $addedFiles++;
                        }
                    } catch (\Exception $e) {
                        $skippedFiles[] = [
                            'filename' => $document->filename,
                            'code' => $document->code,
                            'reason' => $e->getMessage(),
                        ];
                    }
                } else {
                    $missingFiles[] = [
                        'filename' => $document->filename,
                        'code' => $document->code,
                        'expected_path' => $documentPath,
                    ];
                }
            }

            // Add metadata
            $metadata = $this->generateMetadata($documents, $addedFiles, $missingFiles, $skippedFiles);
            $zip->addFromString('backup_metadata.json', json_encode($metadata, JSON_PRETTY_PRINT));

            // Close the ZIP file properly
            $closeResult = $zip->close();

            if (!$closeResult) {
                throw new \Exception('Failed to close ZIP file properly');
            }

            // Wait for file system to finish writing
            usleep(500000); // 0.5 seconds

            // Verify file exists and is valid
            if (!file_exists($fullPath)) {
                throw new \Exception('Backup ZIP file was not created at: ' . $fullPath);
            }

            $fileSize = filesize($fullPath);

            if ($fileSize === 0) {
                throw new \Exception('Backup ZIP file is empty. Added files: ' . $addedFiles);
            }

            // Try to open the ZIP to verify it's valid
            $testZip = new ZipArchive();
            $testResult = $testZip->open($fullPath, ZipArchive::CHECKCONS);
            if ($testResult !== true) {
                throw new \Exception('Created ZIP file is corrupted. Error code: ' . $testResult);
            }
            $testZip->close();

            $backup = Backup::create([
                'user_id' => Auth::id(),
                'type' => 'document',
                'filename' => $filename,
                'path' => $relativePath,
                'size' => $fileSize,
                'successful' => true,
                'error_message' => null,
            ]);

            return $backup;
        } catch (\Exception $e) {
            // Clean up corrupted file if exists
            if (isset($fullPath) && file_exists($fullPath)) {
                @unlink($fullPath);
            }

            $backup = Backup::create([
                'user_id' => Auth::id(),
                'type' => 'document',
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
     * Generate structured path for document in ZIP
     * Structure: documents/{department_code}/{status}/{filename}
     */
    protected function getZipPath(Document $document): string
    {
        $path = 'documents/';

        // 1. Get department code from creator's department
        $departmentCode = $this->getDepartmentCode($document);
        $path .= $departmentCode . '/';

        // 2. Organize by Status (secondary grouping under department)
        $statusFolder = str_replace('_', '-', $document->status);
        $path .= ucfirst($statusFolder) . '/';

        // 3. Add original filename
        $path .= $document->filename;

        return $path;
    }

    /**
     * Get department code from document's creator
     */
    protected function getDepartmentCode(Document $document): string
    {
        // Get department code from creator's department relationship
        if ($document->createdBy && $document->createdBy->department) {
            $deptCode = $document->createdBy->department->code ?? null;
            if ($deptCode) {
                return strtoupper($deptCode);
            }
        }

        // Fallback: Extract from document code (first part before hyphen)
        // Example: "OP-2025-ADM-0002" -> "OP"
        if (!empty($document->code) && preg_match('/^([A-Z]{2,4})-/', $document->code, $matches)) {
            return $matches[1];
        }

        // Fallback: Use first 2-3 letters from code
        if (!empty($document->code)) {
            return strtoupper(substr($document->code, 0, 3));
        }

        // Final fallback
        return 'NO-DEPT';
    }

    /**
     * Generate shortened path for long filenames
     */
    protected function getShortenedZipPath(Document $document): string
    {
        $path = 'docs/';

        // Use department code
        $departmentCode = $this->getDepartmentCode($document);
        $path .= $departmentCode . '/';

        // Use status abbreviation
        $statusAbbr = [
            'draft' => 'DFT',
            'in_review' => 'REV',
            'approved' => 'APP',
            'rejected' => 'REJ',
            'published' => 'PUB',
            'obsolete' => 'OBS',
        ];
        $path .= ($statusAbbr[$document->status] ?? substr(strtoupper($document->status), 0, 3)) . '/';

        // Shorten filename if needed
        $filename = $document->filename;
        if (strlen($filename) > 50) {
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            $name = pathinfo($filename, PATHINFO_FILENAME);
            $filename = substr($name, 0, 40) . '.' . $ext;
        }

        $path .= $filename;

        return $path;
    }

    /**
     * Generate metadata for the backup
     */
    protected function generateMetadata(
        $documents,
        int $addedFiles,
        array $missingFiles,
        array $skippedFiles = []
    ): array {
        // Group by department code with detailed info
        $byDepartment = $documents->groupBy(function ($doc) {
            return $this->getDepartmentCode($doc);
        })->map(function ($deptDocs, $deptCode) {
            $firstDoc = $deptDocs->first();
            $deptName = $firstDoc?->createdBy?->department?->name ?? 'Unknown';

            return [
                'code' => $deptCode,
                'name' => $deptName,
                'count' => $deptDocs->count(),
                'by_status' => $deptDocs->groupBy('status')->map->count(),
                'sample_codes' => $deptDocs->take(3)->pluck('code')->toArray(),
            ];
        });

        return [
            'backup_date' => now()->toIso8601String(),
            'backup_type' => 'documents',
            'total_documents' => $documents->count(),
            'backed_up_files' => $addedFiles,
            'missing_files_count' => count($missingFiles),
            'missing_files' => $missingFiles,
            'skipped_files_count' => count($skippedFiles),
            'skipped_files' => $skippedFiles,
            'system_info' => [
                'app_name' => config('app.name'),
                'app_version' => config('app.version', '1.0.0'),
                'laravel_version' => app()->version(),
                'php_version' => PHP_VERSION,
            ],
            'statistics' => [
                'by_department' => $byDepartment,
                'by_status' => $documents->groupBy('status')->map->count(),
                'by_category' => $documents->groupBy(function ($doc) {
                    return $doc->category?->name ?? 'Unknown';
                })->map->count(),
            ],
            'folder_structure' => [
                'level_1' => 'Department Code (from departments.code via creator)',
                'level_2' => 'Status (draft, in-review, approved, rejected, published)',
                'level_3' => 'Filename',
                'example' => 'documents/CS/Approved/1761207361_68f9e4414367f.pdf',
                'note' => 'Department codes are retrieved from departments.code column',
            ],
        ];
    }

    public function download(Backup $backup)
    {
        if (!$this->fileService->exists($backup->filename, $this->backupDirectory)) {
            throw new \Exception('Backup file not found: ' . $backup->filename);
        }

        return $this->fileService->download($backup->filename, $this->backupDirectory);
    }

    public function delete(Backup $backup): bool
    {
        if ($this->fileService->exists($backup->filename, $this->backupDirectory)) {
            $fullPath = $this->fileService->getPath($backup->filename, $this->backupDirectory);
            unlink($fullPath);
        }

        return $backup->delete();
    }

    public function getAllBackups()
    {
        return Backup::with('user')
            ->where('type', 'document')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPaginatedBackups(int $perPage = 10)
    {
        return Backup::with('user')
            ->where('type', 'document')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function cleanOldBackups(): void
    {
        $cutoffDate = now()->subDays(30);

        $oldBackups = Backup::where('type', 'document')
            ->where('created_at', '<', $cutoffDate)
            ->get();

        foreach ($oldBackups as $backup) {
            $this->delete($backup);
        }
    }
}
