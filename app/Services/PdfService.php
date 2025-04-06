<?php

namespace App\Services;

use App\Models\Document;
use setasign\Fpdi\Fpdi;
use Illuminate\Support\Facades\Storage;

class PdfService
{
    public function download(Document $document)
    {
        return Storage::download("documents/{$document->title}");
    }

    public function exists(Document $document)
    {
        return Storage::exists("documents/{$document->title}");
    }

    public function updateVersion(Document $document, string $version)
    {
        $existingPdfPath = Storage::path("documents/{$document->title}");
        $pdf = new Fpdi();

        $pageCount = $pdf->setSourceFile($existingPdfPath);

        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            $this->addVersionToPage($pdf, $pageNo, $version);
        }

        $pdf->Output($existingPdfPath, 'F');
    }

    private function addVersionToPage(Fpdi $pdf, int $pageNo, string $version): void
    {
        $pdf->AddPage();
        $templateId = $pdf->importPage($pageNo);
        $pdf->useImportedPage($templateId);

        $footerX = 23;
        $footerY = 275;

        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect($footerX, $footerY - 5, 100, 50, 'F');

        $pdf->SetFont('Helvetica', '', 6);
        $pdf->SetTextColor(128, 128, 128);
        $pdf->SetXY($footerX, $footerY);
        $pdf->Write(0, "VERSION: $version");
    }
}
