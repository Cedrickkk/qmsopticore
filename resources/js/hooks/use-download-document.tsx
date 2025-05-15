import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DocumentServiceApi } from '@/services/app';
import { Document } from '@/types/document';
import { AlertCircle, FileDown } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

export function useDownloadDocument() {
  const handleDownload = useCallback(async (documentData: Document) => {
    const { data, error } = await DocumentServiceApi.download(documentData);

    if (error) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Uh oh! Something went wrong.</AlertTitle>
          <AlertDescription>{error ? error : 'There was a problem downloading the file. Please try again.'}</AlertDescription>
        </Alert>
      );
      return;
    }

    if (data) {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentData.title;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast(
        <Alert className="border-none p-0 font-sans">
          <FileDown className="h-4 w-4" color="green" />
          <AlertTitle className="flex items-center gap-1.5 font-medium text-green-600">Download Complete</AlertTitle>
          <AlertDescription>{documentData.title} has been downloaded.</AlertDescription>
        </Alert>
      );
    }
  }, []);

  return { handleDownload };
}
