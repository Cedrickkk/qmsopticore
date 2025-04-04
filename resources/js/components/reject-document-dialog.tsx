import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface RejectDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
}

export function RejectDocumentDialog({ isOpen, onClose, documentId }: RejectDocumentModalProps) {
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
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !reason.trim()}>
            {isSubmitting && <LoaderCircle h-4 w-4 animate-spin />} Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
