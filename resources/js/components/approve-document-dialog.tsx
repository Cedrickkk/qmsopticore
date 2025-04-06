import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FlaskServiceApi } from '@/services/flask';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ApproveDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
}

type Signature = {
  file_name: string;
};

type PageProps = {
  file: File;
  signatures: Signature[];
};

export function ApproveDocumentDialog({ isOpen, onClose, documentId }: ApproveDocumentModalProps) {
  const { auth } = usePage<SharedData>().props;
  const { file, signatures } = usePage<PageProps>().props;
  const [signingInProgress, setSigningInProgress] = useState(false);
  const { data, setData, post, processing } = useForm<{ comment: string }>({
    comment: '',
  });

  const isLoading = signingInProgress || processing;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSigningInProgress(true);

      const { error, message } = await FlaskServiceApi.signDocument({
        pdf: file,
        signatory: auth.user.name,
        signatures,
      });

      if (message) {
        post(`/documents/${documentId}/approve`, {
          preserveScroll: true,
          showProgress: false,
          preserveState: true,
          onFinish: () => {
            setSigningInProgress(false);
            onClose();
          },
        });

        toast(
          <Alert className="border-none p-0 font-sans">
            <AlertTitle className="flex items-center gap-1.5 font-medium text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check-circle"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Signature Applied
            </AlertTitle>
            <AlertDescription>{message} Your approval will be processed momentarily.</AlertDescription>
          </Alert>
        );
      }

      if (error) {
        toast(
          <Alert variant="destructive" className="border-none p-0 font-sans">
            <AlertTitle className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-alert-circle"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Uh oh! Something went wrong
            </AlertTitle>
            <AlertDescription>{error ? error : 'There was a problem signing the file. Please try again.'}</AlertDescription>
          </Alert>
        );

        setSigningInProgress(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>Could not connect to the signature service. Please try again later.</AlertDescription>
        </Alert>
      );

      // Reset loading state
      setSigningInProgress(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Document</DialogTitle>
          <DialogDescription>Are you sure you want to approve "{document.title}"? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                value={data.comment}
                onChange={e => setData('comment', e.target.value)}
                placeholder="Add an optional comment with your approval"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[100px]">
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  {signingInProgress ? 'Signing...' : 'Processing...'}
                </>
              ) : (
                'Approve'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
