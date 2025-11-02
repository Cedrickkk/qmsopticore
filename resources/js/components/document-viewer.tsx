import { PDFControls } from '@/components/document-viewer-controls';
import { PDFThumbnails } from '@/components/document-viewer-thumbnails';
import '@/lib/pdfjs';
import { type Document as TDocument } from '@/types/document';
import { usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { File } from 'react-pdf/dist/esm/shared/types.js';

interface PDFPageState {
  numPages: number;
  currentPage: number;
  scale: number;
  isLoading: boolean;
  error: string | null;
}

interface PDFViewerProps {
  file: File;
  showThumbnails?: boolean;
}

type PageProps = {
  document: TDocument;
};

export const PDFViewer = memo(function PDFViewerComponent({ file, showThumbnails = false }: PDFViewerProps) {
  const { document } = usePage<PageProps>().props;
  const [pdfState, setPdfState] = useState<PDFPageState>({
    numPages: 0,
    currentPage: 1,
    scale: 0.8,
    isLoading: true,
    error: null,
  });

  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setPdfState(prev => ({
      ...prev,
      numPages,
      isLoading: false,
      error: null,
    }));
  }, []);

  const handleDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setPdfState(prev => ({
      ...prev,
      isLoading: false,
      error: error.message,
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPdfState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(newPage, prev.numPages)),
    }));
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setPdfState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale + delta)),
    }));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Document
        className="bg-primary/10 border-primary w-full overflow-hidden rounded-xs border shadow-sm"
        key={document.status}
        file={file}
        loading={
          <div className="flex h-[70vh] items-center justify-center">
            <LoaderCircle className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        }
        error={
          <div className="flex h-[70vh] flex-col items-center justify-center gap-2">
            <p className="text-destructive font-medium">Failed to load PDF</p>
            {pdfState.error && <p className="text-muted-foreground text-sm">{pdfState.error}</p>}
          </div>
        }
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
      >
        <div className="flex h-[90vh] w-full items-center justify-center overflow-auto p-4">
          <Page
            key={`page_${pdfState.currentPage}_${pdfState.scale}`}
            pageNumber={pdfState.currentPage}
            scale={pdfState.scale}
            className="mx-auto shadow-sm"
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={
              <div className="flex h-full items-center justify-center">
                <LoaderCircle className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            }
          />
        </div>
      </Document>

      {showThumbnails && pdfState.numPages > 0 && (
        <Document file={file}>
          <PDFThumbnails numPages={pdfState.numPages} currentPage={pdfState.currentPage} onPageChange={handlePageChange} />
        </Document>
      )}

      <PDFControls
        currentPage={pdfState.currentPage}
        numPages={pdfState.numPages}
        scale={pdfState.scale}
        onPageChange={handlePageChange}
        onZoom={handleZoom}
      />
    </div>
  );
});
