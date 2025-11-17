import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Eye } from 'lucide-react';
import { File } from 'react-pdf/dist/esm/shared/types.js';
import { PDFViewerWithSecurity } from './document-viewer-with-security';

interface DocumentPreviewerProps {
  file: File;
  confidentiality_level: 'public' | 'internal' | 'confidential';
  auto_blur_after_seconds: number;
  requires_reauth_on_view: boolean;
}

export function DocumentPreviewer({ file, confidentiality_level, auto_blur_after_seconds, requires_reauth_on_view }: DocumentPreviewerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex w-full items-center justify-start gap-2 rounded-xs">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-4xl min-w-[75vw] overflow-y-auto px-12 py-6 pt-12">
        <SheetHeader className="sr-only">
          <SheetTitle>Document Preview</SheetTitle>
          <SheetDescription>View and navigate through the document.</SheetDescription>
        </SheetHeader>
        <PDFViewerWithSecurity
          file={file}
          showThumbnails
          confidentiality_level={confidentiality_level}
          auto_blur_after_seconds={auto_blur_after_seconds}
          require_reauth_on_view={requires_reauth_on_view}
        />
      </SheetContent>
    </Sheet>
  );
}
