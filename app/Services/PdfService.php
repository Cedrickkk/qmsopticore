<?php

namespace App\Services;

use App\Models\Document;
use setasign\Fpdi\Fpdi;
use Illuminate\Support\Facades\Storage;

class PdfService
{
    public function addFooterDetails(Document $document, string $version)
    {
        $path = Storage::path("documents/{$document->filename}");

        $pdf = new Fpdi();

        $pageCount = $pdf->setSourceFile($path);

        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            $this->addFooterToPage($pdf, $pageNo, $version, $document->code);
        }

        $pdf->Output($path, 'F');
    }

    private function addFooterToPage(Fpdi $pdf, int $pageNo, string $version, string $code): void
    {
        $pdf->AddPage();
        $templateId = $pdf->importPage($pageNo);
        $pdf->useImportedPage($templateId);

        $pageHeight = $pdf->GetPageHeight();
        $pageWidth = $pdf->GetPageWidth();

        $pdf->SetFont('Helvetica', '', 6);
        $pdf->SetTextColor(128, 128, 128);

        $footerY = $pageHeight - 5;

        $codeText = "DOCUMENT CODE: $code";
        $codeX = 5;

        $versionText = "VERSION: $version";
        $versionTextWidth = $pdf->GetStringWidth($versionText);
        $versionX = $pageWidth - $versionTextWidth - 5;

        $pdf->SetAutoPageBreak(false);
        $pdf->Text($codeX, $footerY, $codeText);
        $pdf->Text($versionX, $footerY, $versionText);
        $pdf->SetAutoPageBreak(true, 10);
    }
}
