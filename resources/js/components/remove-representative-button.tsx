import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface RemoveRepresentativeButtonProps {
  documentId: number;
}

export function RemoveRepresentativeButton({ documentId }: RemoveRepresentativeButtonProps) {
  const handleRemove = () => {
    if (confirm('Are you sure you want to remove the representative?')) {
      router.delete(route('documents.remove-representative', documentId), {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Representative removed successfully');
        },
        onError: () => {
          toast.error('Failed to remove representative');
        },
      });
    }
  };

  return (
    <Button variant="outline" className="text-destructive hover:text-destructive w-full justify-start gap-2" onClick={handleRemove}>
      <UserMinus className="h-4 w-4" />
      Remove Representative
    </Button>
  );
}
