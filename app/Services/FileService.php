<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class FileService
{
    public function upload($file, string $directory = 'documents', string $filename): string
    {
        Storage::putFileAs($directory, $file, $filename);

        return $filename;
    }

    public function uploadMultiple(array $files, string $directory = 'signatures'): array
    {
        $filenames = [];

        foreach ($files as $file) {
            $filename = $this->generateUniqueFilename($file);
            Storage::putFileAs($directory, $file, name: $filename);
            $filenames[] = $filename;
        }

        return $filenames;
    }


    public function download(string $filename, string $directory = 'documents')
    {
        return Storage::download("$directory/$filename");
    }

    public function exists(string $filename, string $directory = 'documents'): bool
    {
        return Storage::exists("$directory/$filename");
    }

    public function getUrlPath(string $filename, string $directory = 'documents')
    {
        if (!$filename) {
            return null;
        }

        return Storage::url("$directory/$filename");
    }

    public function generateUniqueFilename($file): string
    {
        $extension = $file->getClientOriginalExtension();
        return time() . '_' . uniqid() . '.' . $extension;
    }
}
