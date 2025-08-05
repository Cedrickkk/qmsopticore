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
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface RejectDocumentModalProps {
  documentId: number;
}

export function RejectDocumentDialog({ documentId }: RejectDocumentModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = () => {
    setIsSubmitting(true);
    router.post(
      `/documents/${documentId}/reject`,
      {
        reason,
      },
      {
        onFinish: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Reject Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Document</DialogTitle>
          <DialogDescription>Please provide a reason for rejecting this document.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" variant="destructive" onClick={handleReject} disabled={isSubmitting || !reason.trim()}>
            {isSubmitting && <LoaderCircle h-4 w-4 animate-spin />} Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
