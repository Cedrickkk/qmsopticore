import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface ApproveDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
}

export function ApproveDocumentDialog({ isOpen, onClose, documentId }: ApproveDocumentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = () => {
    setIsSubmitting(true);
    router.post(
      `/documents/${documentId}/approve`,
      {},
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
          <DialogTitle>Approve Document</DialogTitle>
          <DialogDescription>Are you sure you want to approve this document? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle h-4 w-4 animate-spin />} Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
