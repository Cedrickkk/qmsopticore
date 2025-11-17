import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { FlaskServiceApi } from '@/services/flask';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { AxiosError } from 'axios';
import { AlertCircleIcon, CircleCheckBig, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ApproveDocumentModalProps {
  documentId: number;
  isSigningAsRepresentative?: boolean;
  representativeFor?: string;
}

type Signature = {
  file_name: string;
};

type PageProps = {
  file: File;
  signatures: Signature[];
  document: {
    title: string;
  };
};

export function ApproveDocumentDialog({ documentId, isSigningAsRepresentative, representativeFor }: ApproveDocumentModalProps) {
  const { auth } = usePage<SharedData>().props;
  const { file, signatures, document } = usePage<PageProps>().props;
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [inkColor, setInkColor] = useState<'black' | 'blue'>('black');
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
        signatory: isSigningAsRepresentative ? representativeFor! : auth.user.name,
        signatures,
        representative_name: isSigningAsRepresentative ? auth.user.name : undefined,
        ink_color: inkColor,
      });

      console.log(inkColor);

      if (message) {
        post(`/documents/${documentId}/approve`, {
          preserveScroll: true,
          showProgress: false,
          preserveState: true,
          onFinish: () => {
            setSigningInProgress(false);
          },
        });

        toast(
          <Alert className="border-none p-0 font-sans">
            <CircleCheckBig color="green" />
            <AlertTitle className="text-primary font-medium">Signature Applied</AlertTitle>
            <AlertDescription>
              {isSigningAsRepresentative
                ? `Signed on behalf of ${representativeFor} with ${inkColor} ink. Your approval will be processed momentarily.`
                : `${message} Your approval with ${inkColor} ink will be processed momentarily.`}
            </AlertDescription>
          </Alert>
        );
      }

      if (error) {
        toast(
          <Alert variant="destructive" className="border-none p-0 font-sans">
            <AlertCircleIcon color="red" />
            <AlertTitle className="text-destructive">Uh oh! Something went wrong.</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        );

        setSigningInProgress(false);
        return;
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data.error) {
        toast(
          <Alert variant="destructive" className="border-none p-0 font-sans">
            <AlertCircleIcon />
            <AlertTitle>Failed to add signatures</AlertTitle>
            <AlertDescription>
              {error.response.data.error ? error.response.data.error : 'There was a problem signing the file. Please try again.'}
            </AlertDescription>
          </Alert>
        );
      }
      toast(
        <Alert variant="destructive" className="text-destructive border-none p-0 font-sans">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>Could not connect to the signature service. Please try again later.</AlertDescription>
        </Alert>
      );

      setSigningInProgress(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Approve Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Document</DialogTitle>
          <DialogDescription>
            {isSigningAsRepresentative ? (
              <>
                You are approving this document on behalf of <strong>{representativeFor}</strong>. Your signature will be used.
              </>
            ) : (
              <>Are you sure you want to approve "{document.title}"? This action cannot be undone.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">Ink Color</Label>
              <RadioGroup value={inkColor} onValueChange={value => setInkColor(value as 'black' | 'blue')} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="black" />
                  <Label htmlFor="black" className="cursor-pointer font-normal">
                    Black
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blue" id="blue" />
                  <Label htmlFor="blue" className="flex cursor-pointer items-center gap-1 font-normal">
                    Blue
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Comment */}
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
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
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
