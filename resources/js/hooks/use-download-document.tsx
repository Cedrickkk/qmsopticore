import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DocumentServiceApi } from '@/services/app';
import { Document } from '@/types/document';
import { AlertCircle, CircleCheckBig } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useDownloadDocument() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingDocument, setPendingDocument] = useState<Document | null>(null);
  const [password, setPassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async (documentData: Document) => {
    if (documentData.confidentiality_level === 'confidential') {
      setPendingDocument(documentData);
      setPassword('');
      setIsPasswordDialogOpen(true);
      return;
    }

    await performDownload(documentData, null);
  }, []);

  const performDownload = async (documentData: Document, userPassword: string | null) => {
    setIsDownloading(true);

    const { data, error } = await DocumentServiceApi.download(documentData, userPassword);

    setIsDownloading(false);

    if (error) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Uh oh! Something went wrong.</AlertTitle>
          <AlertDescription>
            {error === 'Invalid password.'
              ? 'Invalid password. Please try again.'
              : error || 'There was a problem downloading the file. Please try again.'}
          </AlertDescription>
        </Alert>
      );
      return;
    }

    if (data) {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;

      const filename = documentData.confidentiality_level === 'confidential' ? `${documentData.title}` : documentData.title;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast(
        <Alert className="border-none p-0 font-sans">
          <CircleCheckBig color="green" />
          <AlertTitle className="text-primary font-medium">Download Complete</AlertTitle>
          <AlertDescription>
            {documentData.confidentiality_level === 'confidential'
              ? `${documentData.title} has been downloaded as a password-protected ZIP file. Use your account password to extract it.`
              : `${documentData.title} has been downloaded.`}
          </AlertDescription>
        </Alert>
      );

      setIsPasswordDialogOpen(false);
      setPendingDocument(null);
      setPassword('');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password || !pendingDocument) return;
    await performDownload(pendingDocument, password);
  };

  const handlePasswordCancel = () => {
    setIsPasswordDialogOpen(false);
    setPendingDocument(null);
    setPassword('');
  };

  return {
    handleDownload,
    isPasswordDialogOpen,
    setIsPasswordDialogOpen: handlePasswordCancel,
    password,
    setPassword,
    handlePasswordSubmit,
    handlePasswordCancel,
    isDownloading,
    pendingDocument,
  };
}
