import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDownloadDocument } from '@/hooks/use-download-document';
import { Document } from '@/types/document';
import { Link } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { ArchiveX, Download, Eye, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import DocumentArchiveForm from './document-archive-form';
import { PasswordDownloadDialog } from './password-download-dialog';

interface TableActionsProps {
  row: Row<Document>;
}

export default function DocumentTableActions({ row }: TableActionsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { handleDownload, isPasswordDialogOpen, handlePasswordCancel, password, setPassword, handlePasswordSubmit, isDownloading, pendingDocument } =
    useDownloadDocument();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-sm">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/documents/${row.original.id}`}>
              <Eye />
              <span>View Document</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload(row.original)}>
            <Download /> <span>Download PDF </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive dark:bg-destructive dark:text-white" onClick={() => setIsOpen(open => !open)}>
            <ArchiveX className="text-destructive dark:text-white" />
            <span>Archive Document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DocumentArchiveForm open={isOpen} onOpenChange={setIsOpen} document={row.original} />
      <PasswordDownloadDialog
        isOpen={isPasswordDialogOpen}
        onClose={handlePasswordCancel}
        password={password}
        setPassword={setPassword}
        onSubmit={handlePasswordSubmit}
        isDownloading={isDownloading}
        documentTitle={pendingDocument?.title}
      />
    </>
  );
}
