<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use setasign\Fpdi\Tcpdf\Fpdi;

class PdfEncryptionService
{
  public function encryptPdf(string $sourcePath, string $destinationPath, string $password): bool
  {
    try {
      $pdf = new Fpdi();

      $pdf->SetProtection(
        ['print', 'copy'],
        $password,
        null,
        0,
        null
      );

      $pageCount = $pdf->setSourceFile($sourcePath);

      for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
        $templateId = $pdf->importPage($pageNo);
        $size = $pdf->getTemplateSize($templateId);

        $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
        $pdf->useTemplate($templateId);
      }

      $pdf->Output($destinationPath, 'F');

      return true;
    } catch (\Exception $e) {
      Log::error("PDF encryption failed: " . $e->getMessage());
      return false;
    }
  }
}
