import InputError from '@/components/input-error';
import { FolderUp } from 'lucide-react';
import { Document, Page } from 'react-pdf';

interface DocumentUploadProps {
  file: File | null;
  onChange: (file: File) => void;
  error?: string;
}

export function DocumentUpload({ file, onChange, error }: DocumentUploadProps) {
  return (
    <label className="border-primary flex h-[700px] cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed p-10">
      <input type="file" className="hidden" accept="application/pdf" onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />

      {file ? (
        <Document
          className="bg-primary/10 relative flex justify-center rounded-sm border shadow-sm transition-colors"
          file={file}
          loading={
            <div className="flex h-[600px] w-[500px] items-center justify-center">
              <span className="text-muted-foreground text-sm">Loading PDF...</span>
            </div>
          }
        >
          <div className="flex h-[600px] w-[500px] items-center justify-center overflow-y-auto p-4">
            <Page key={`page_${file}`} pageNumber={1} scale={0.6} className="shadow-sm" renderTextLayer={false} renderAnnotationLayer={false} />
          </div>
        </Document>
      ) : (
        <>
          <FolderUp size={56} className="text-primary" />
          <p className="tracking-tsight text-primary font-medium">Select a PDF file to upload</p>
          <small className="text-muted-foreground text-sm leading-none font-medium">Maximum file size 2mb</small>
        </>
      )}

      <InputError message={error} />
    </label>
  );
}
