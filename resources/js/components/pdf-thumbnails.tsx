import { cn } from '@/lib/utils';
import { Document, Page } from 'react-pdf';
import { File } from 'react-pdf/dist/esm/shared/types.js';

interface PDFThumbnailsProps {
  file: File;
  numPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PDFThumbnails({ file, numPages, currentPage, onPageChange }: PDFThumbnailsProps) {
  return (
    <div className="flex h-1/2 gap-2 overflow-y-auto rounded-sm border p-7">
      {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
        <button
          key={`thumb_${pageNum}`}
          onClick={() => onPageChange(pageNum)}
          className={cn(
            'min-w-[200px] rounded-sm border p-1 transition-colors',
            pageNum === currentPage ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
          )}
        >
          <Document
            file={file}
            className="flex justify-center"
            loading={
              <div className="items-center justify-center">
                <span className="text-muted-foreground text-sm">Loading PDF...</span>
              </div>
            }
          >
            <Page pageNumber={pageNum} width={150} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        </button>
      ))}
    </div>
  );
}
