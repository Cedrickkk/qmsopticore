import '@/lib/pdfjs';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import { memo } from 'react';
import { Page } from 'react-pdf';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

interface PDFThumbnailsProps {
  numPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const PDFThumbnails = memo(function PDFThumbnailsViewer({ numPages, currentPage, onPageChange }: PDFThumbnailsProps) {
  return (
    <ScrollArea className="w-full rounded-xs border">
      <div className="flex gap-2 p-4">
        {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={`thumb_${pageNum}`}
            onClick={() => onPageChange(pageNum)}
            className={cn(
              'flex-shrink-0 rounded-xs border p-1 transition-colors',
              pageNum === currentPage ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
            )}
          >
            <Page
              pageNumber={pageNum}
              width={150}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className="flex h-[100px] w-[150px] items-center justify-center">
                  <LoaderCircle className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              }
            />
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
});
