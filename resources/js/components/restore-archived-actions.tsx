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
import { ArchivedDocument } from '@/pages/archives';
import { Link } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { Download, Eye, MoreHorizontal, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import RestoreArchivedDocumentForm from './document-restore-form';

interface RestorDocumentActionsProps {
  row: Row<ArchivedDocument>;
}

export default function RestoreDocumentActions({ row }: RestorDocumentActionsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { handleDownload } = useDownloadDocument();
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
            <Link href={`/archives/${row.original.id}`}>
              <Eye />
              <span>View Document</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload(row.original.document)}>
            <Download /> <span>Download PDF </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsOpen(open => !open)} className="text-primary">
            <RotateCcw className="text-primary" /> <span>Restore Document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RestoreArchivedDocumentForm document={row.original} onOpenChange={setIsOpen} open={isOpen} />
    </>
  );
}
