import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pen } from 'lucide-react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { File } from 'react-pdf/dist/esm/shared/types.js';

/**
 * React-PDF Configuration
 */
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface PDFPageState {
  numPages: number;
  currentPage: number;
  scale: number;
  isLoading: boolean;
}

interface PDFViewerProps {
  file: File;
  className?: string;
  showThumbnails?: boolean;
}

export function PDFViewer({ file, className, showThumbnails = false }: PDFViewerProps) {
  const [pdfState, setPdfState] = useState<PDFPageState>({
    numPages: 0,
    currentPage: 1,
    scale: 1.0,
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
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between">
        <Button className="gap-2" size="lg">
          <Pen className="size-4" />
          Sign
        </Button>
      </div>

      {/* PDF Controls */}
      <div className="flex items-center justify-between gap-2 border-b pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm"
            onClick={() => handlePageChange(pdfState.currentPage - 1)}
            disabled={pdfState.currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {pdfState.currentPage} of {pdfState.numPages}
          </span>
          <Button
            variant="outline"
            className="rounded-sm"
            onClick={() => handlePageChange(pdfState.currentPage + 1)}
            disabled={pdfState.currentPage >= pdfState.numPages}
          >
            Next
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleZoom(-0.1)} className="rounded-sm">
            -
          </Button>
          <span className="text-sm font-medium">{Math.round(pdfState.scale * 100)}%</span>
          <Button variant="outline" onClick={() => handleZoom(0.1)} className="rounded-sm">
            +
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <Document
        className="bg-background relative rounded-sm border shadow-sm"
        file={file}
        loading={
          <div className="flex h-[700px] items-center justify-center">
            <span className="text-muted-foreground">Loading PDF...</span>
          </div>
        }
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={() => {
          console.error('Error loading PDF');
        }}
      >
        <div className="flex h-[700px] items-center justify-center overflow-y-auto p-4">
          <Page
            key={`page_${pdfState.currentPage}`}
            pageNumber={pdfState.currentPage}
            scale={pdfState.scale}
            className="shadow-sm"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      </Document>

      {/* Thumbnails */}
      {showThumbnails && (
        <div className="mt-4 flex gap-2 overflow-x-auto border-t pt-4">
          {Array.from({ length: pdfState.numPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={`thumb_${pageNum}`}
              onClick={() => handlePageChange(pageNum)}
              className={cn(
                'min-w-[100px] rounded-sm border p-1 transition-colors',
                pageNum === pdfState.currentPage ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
              )}
            >
              <Document file={file}>
                <Page pageNumber={pageNum} width={100} renderTextLayer={false} renderAnnotationLayer={false} />
              </Document>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
