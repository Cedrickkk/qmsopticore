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
import { Document } from '@/types/document';
import { useForm } from '@inertiajs/react';
import { FileDown, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';

interface DocumentArchiveFormProps {
  open: boolean;
  document: Document;
  onOpenChange: (state: boolean) => void;
}

export default function DocumentArchiveForm({ open, onOpenChange, document }: DocumentArchiveFormProps) {
  const { data, setData, patch, processing } = useForm({
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(`/documents/${document.id}/archive`, {
      preserveState: true,
      showProgress: false,
      onSuccess: () => {
        onOpenChange(!open);
        toast(
          <Alert className="border-none p-0 font-sans">
            <FileDown className="h-4 w-4" color="green" />
            <AlertTitle className="text-primary font-medium">Document Archived</AlertTitle>
            <AlertDescription>{document.title} has been archived.</AlertDescription>
          </Alert>
        );
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to archive this document?</AlertDialogTitle>
          <AlertDialogDescription>This action will move the document to the archive. You can restore it later if needed.</AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={data.reason}
          onChange={e => setData('reason', e.target.value)}
          placeholder="Add an optional comment with your approval"
          className="min-h-[100px]"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button disabled={processing} variant="destructive" onClick={handleSubmit}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Archive
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
