import { RepresentativeSearch } from '@/components/search-representative';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { CircleCheck, UserPlus, X } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface SetRepresentativeDialogProps {
  documentId: number;
  currentRepresentative?: {
    id: number;
    name: string;
  } | null;
}

export function SetRepresentativeDialog({ documentId, currentRepresentative }: SetRepresentativeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { setData, post, processing, errors, reset } = useForm({
    representative_user_id: '',
  });

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setData('representative_user_id', user.id.toString());
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
    setData('representative_user_id', '');
  };

  const submit: FormEventHandler = e => {
    e.preventDefault();

    if (!selectedUser) {
      toast(
        <Alert variant="destructive" className="text-destructive border-none p-0 font-sans">
          <AlertTitle>Selection required</AlertTitle>
          <AlertDescription className="text-muted-foreground text-sm">Please select a representative</AlertDescription>
        </Alert>
      );
      return;
    }

    post(route('documents.set-representative', documentId), {
      preserveScroll: true,
      onSuccess: () => {
        toast(
          <Alert className="border-none p-0 font-sans">
            <CircleCheck className="h-4 w-4" color="green" />
            <AlertTitle className="text-primary font-medium">Assignment successful.</AlertTitle>
            <AlertDescription>Representative assigned successfully</AlertDescription>
          </Alert>
        );
        setOpen(false);
        setSelectedUser(null);
        reset();
      },
      onError: () => {
        toast(
          <Alert variant="destructive" className="text-destructive border-none p-0 font-sans">
            <AlertTitle>Assignment failed.</AlertTitle>
            <AlertDescription className="text-muted-foreground text-sm">Failed to assign representative</AlertDescription>
          </Alert>
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <UserPlus className="h-4 w-4" />
          {currentRepresentative ? 'Change Representative' : 'Assign Representative'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Assign Representative</DialogTitle>
            <DialogDescription>
              Assign a representative from your department who can sign this document on your behalf.
              {currentRepresentative && (
                <span className="mt-2 block text-sm font-medium">
                  Current: <span className="text-foreground">{currentRepresentative.name}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!selectedUser ? (
              <RepresentativeSearch onSelectUser={handleSelectUser} />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar || undefined} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedUser.name}</p>
                      <p className="text-muted-foreground text-xs">{selectedUser.email}</p>
                      {selectedUser.position && <p className="text-muted-foreground text-xs">{selectedUser.position}</p>}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveUser}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">This user will be able to sign the document on your behalf</p>
              </div>
            )}
            {errors.representative_user_id && <p className="text-destructive text-sm">{errors.representative_user_id}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedUser(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing || !selectedUser}>
              {processing ? 'Assigning...' : 'Assign Representative'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
