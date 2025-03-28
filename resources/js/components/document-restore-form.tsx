import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { type Document } from '@/types/document';
import { useForm } from '@inertiajs/react';
import { FileDown, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RestoreArchivedDocumentFormProps {
  open: boolean;
  document: Document;
  onOpenChange: (state: boolean) => void;
}

export default function RestoreArchivedDocumentForm({ document, open, onOpenChange }: RestoreArchivedDocumentFormProps) {
  const { patch, processing } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(`/documents/${document.id}/unarchive`, {
      preserveState: true,
      showProgress: false,
      onFinish: () => {
        onOpenChange(!open);
        toast(
          <Alert className="border-none p-0 font-sans">
            <FileDown className="h-4 w-4" />
            <AlertTitle>Document Restored</AlertTitle>
            <AlertDescription>{document.title} has been restored.</AlertDescription>
          </Alert>
        );
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to restore this document?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will move the document back to the documents table, and will be publicly accessible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button disabled={processing} onClick={handleSubmit}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Restore
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
