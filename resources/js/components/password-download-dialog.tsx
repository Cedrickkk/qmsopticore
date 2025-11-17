import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert } from 'lucide-react';

interface PasswordDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: () => void;
  isDownloading: boolean;
  documentTitle?: string;
}

export function PasswordDownloadDialog({
  isOpen,
  onClose,
  password,
  setPassword,
  onSubmit,
  isDownloading,
  documentTitle,
}: PasswordDownloadDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password) {
      onSubmit();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Confidential Document</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {documentTitle && <span className="text-foreground mb-2 block font-medium">{documentTitle}</span>}
            This document is marked as confidential. Please enter your account password to download.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              Account Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDownloading}
              autoFocus
              className="col-span-3"
            />
          </div>
          <p className="text-muted-foreground text-xs">The downloaded file will be password-protected. Use the same password to extract it.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDownloading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} disabled={!password || isDownloading}>
            {isDownloading && <Loader2 className="h-4 w-4 animate-spin" />}
            Download
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
