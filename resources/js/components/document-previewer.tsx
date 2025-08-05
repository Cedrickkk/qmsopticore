import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Eye } from 'lucide-react';
import { File } from 'react-pdf/dist/esm/shared/types.js';
import { PDFViewer } from './document-viewer';

interface DocumentPreviewerProps {
  file: File;
}

export function DocumentPreviewer({ file }: DocumentPreviewerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex w-full items-center justify-start gap-2 rounded-xs">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-4xl min-w-[65vw] p-6">
        <SheetHeader className="sr-only p-6 pb-0">
          <SheetTitle>Document Preview</SheetTitle>
          <SheetDescription>Scroll to view the entire document and controls.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-screen p-6">
          <PDFViewer file={file} showThumbnails />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
