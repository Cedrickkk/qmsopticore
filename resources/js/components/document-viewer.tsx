import { PDFControls } from '@/components/document-viewer-controls';
import { PDFThumbnails } from '@/components/document-viewer-thumbnails';
import { useDownloadDocument } from '@/hooks/use-download-document';
import { type Document as TDocument } from '@/types/document';
import { usePage } from '@inertiajs/react';
import { Download, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { File } from 'react-pdf/dist/esm/shared/types.js';
import { Button } from './ui/button';

interface PDFPageState {
  numPages: number;
  currentPage: number;
  scale: number;
  isLoading: boolean;
}

interface PDFViewerProps {
  file: File;
  showThumbnails?: boolean;
}

type PageProps = {
  document: TDocument;
};

export function PDFViewer({ file, showThumbnails = false }: PDFViewerProps) {
  const { handleDownload } = useDownloadDocument();
  const { document } = usePage<PageProps>().props;
  const [pdfState, setPdfState] = useState<PDFPageState>({
    numPages: 0,
    currentPage: 1,
    scale: 0.8,
    isLoading: true,
  });

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPdfState(prev => ({
      ...prev,
      numPages,
      isLoading: false,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPdfState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(newPage, pdfState.numPages)),
    }));
  };

  const handleZoom = (delta: number) => {
    setPdfState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale + delta)),
    }));
  };

  return (
    <div>
      <div className="my-4 flex flex-col gap-4">
        <Document
          className="bg-primary/10 border-primary relative flex h-fit justify-center rounded-sm border shadow-sm transition-colors"
          file={file}
          loading={
            <div className="flex h-[700px] items-center justify-center">
              <LoaderCircle className="text-muted-foreground animate-spin text-sm">Loading PDF...</LoaderCircle>
            </div>
          }
          onLoadSuccess={handleDocumentLoadSuccess}
        >
          <div className="flex h-[700px] items-center justify-center overflow-y-auto p-4">
            <Page
              key={`page_${pdfState.currentPage}`}
              pageNumber={pdfState.currentPage}
              scale={pdfState.scale}
              className="shadow-sm"
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className="items-center justify-center">
                  <LoaderCircle className="text-muted-foreground animate-spin">Loading PDF...</LoaderCircle>
                </div>
              }
            />
          </div>
        </Document>

        <div className="flex flex-col gap-4">
          {showThumbnails && (
            <PDFThumbnails file={file} numPages={pdfState.numPages} currentPage={pdfState.currentPage} onPageChange={handlePageChange} />
          )}

          <PDFControls
            currentPage={pdfState.currentPage}
            numPages={pdfState.numPages}
            scale={pdfState.scale}
            onPageChange={handlePageChange}
            onZoom={handleZoom}
          />
          <Button variant="outline" className="flex items-center gap-2" onClick={() => handleDownload(document)}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
