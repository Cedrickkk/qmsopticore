<?php

namespace App\Services;

use App\Models\Document;
use setasign\Fpdi\Fpdi;
use Illuminate\Support\Facades\Storage;

class PdfService
{
    public function updateVersion(Document $document, string $version)
    {
        $path = Storage::path("documents/{$document->filename}");

        $pdf = new Fpdi();

        $pageCount = $pdf->setSourceFile($path);

        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            $this->addVersionToPage($pdf, $pageNo, $version);
        }

        $pdf->Output($path, 'F');
    }

    private function addVersionToPage(Fpdi $pdf, int $pageNo, string $version): void
    {
        $pdf->AddPage();
        $templateId = $pdf->importPage($pageNo);
        $pdf->useImportedPage($templateId);

        $pageHeight = $pdf->GetPageHeight();
        $pageWidth = $pdf->GetPageWidth();

        $pdf->SetFont('Helvetica', '', 6);
        $pdf->SetTextColor(128, 128, 128);

        $text = "VERSION: $version";
        $textWidth = $pdf->GetStringWidth($text);

        $footerX = $pageWidth - $textWidth - 5;
        $footerY = $pageHeight - 5;

        $pdf->SetAutoPageBreak(false);
        $pdf->Text($footerX, $footerY, $text);

        $pdf->SetAutoPageBreak(true, 10);
    }
}
