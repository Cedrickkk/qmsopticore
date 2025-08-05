import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface PDFControlsProps {
  currentPage: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onZoom: (delta: number) => void;
}

export function PDFControls({ currentPage, numPages, scale, onPageChange, onZoom }: PDFControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <Pagination className="justify-start">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm font-medium">
              Page {currentPage} of {numPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              className={currentPage >= numPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onZoom(-0.1)}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={() => onZoom(0.1)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
