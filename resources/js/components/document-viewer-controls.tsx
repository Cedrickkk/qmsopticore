import { Button } from '@/components/ui/button';

interface PDFControlsProps {
  currentPage: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onZoom: (delta: number) => void;
}

export function PDFControls({ currentPage, numPages, scale, onPageChange, onZoom }: PDFControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" className="rounded-sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {numPages}
        </span>
        <Button variant="outline" className="rounded-sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= numPages}>
          Next
        </Button>
      </div>
      <div className="flex items-center gap-2 border-l pl-4">
        <Button variant="outline" onClick={() => onZoom(-0.1)} className="rounded-sm">
          -
        </Button>
        <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
        <Button variant="outline" onClick={() => onZoom(0.1)} className="rounded-sm">
          +
        </Button>
      </div>
    </div>
  );
}
