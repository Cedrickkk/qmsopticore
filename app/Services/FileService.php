<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileService
{
    public function upload(UploadedFile $file, string $directory = 'documents'): string
    {
        $fileName = $file->getClientOriginalName();

        Storage::putFileAs($directory, $file, $fileName);

        return $fileName;
    }


    public function download(string $fileName, string $directory = 'documents')
    {
        return Storage::download("$directory/$fileName");
    }

    public function exists(string $fileName, string $directory = 'documents'): bool
    {
        return Storage::exists("$directory/$fileName");
    }

    public function getUrlPath(string $fileName, string $directory = 'documents'): string
    {
        return Storage::url("$directory/$fileName");
    }
}
