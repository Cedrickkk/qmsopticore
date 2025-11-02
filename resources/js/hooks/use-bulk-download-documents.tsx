import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DocumentServiceApi } from '@/services/app';
import { AlertCircle, Download } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useBulkDownloadDocuments() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBulkDownload = useCallback(async (documentIds: number[], onSuccess?: () => void) => {
    if (documentIds.length === 0) return;

    setIsDownloading(true);

    const result = await DocumentServiceApi.bulkDownload(documentIds);

    setIsDownloading(false);

    if (result.error) {
      toast(
        <Alert className="border-none p-0 font-sans">
          <AlertCircle className="h-4 w-4" color="red" />
          <AlertTitle className="text-destructive font-medium">Download Failed</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      );
      return;
    }

    if (result.data) {
      const url = window.URL.createObjectURL(result.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documents_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast(
        <Alert className="border-none p-0 font-sans">
          <Download className="h-4 w-4" color="green" />
          <AlertTitle className="text-primary font-medium">Download Started</AlertTitle>
          <AlertDescription>
            {documentIds.length} document{documentIds.length > 1 ? 's' : ''} downloaded successfully.
          </AlertDescription>
        </Alert>
      );

      onSuccess?.();
    }
  }, []);

  return { handleBulkDownload, isDownloading };
}
