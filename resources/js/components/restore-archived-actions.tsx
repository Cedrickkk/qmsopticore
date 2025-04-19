import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArchivedDocument } from '@/pages/archives';
import { Link } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { Download, Eye, History, MoreHorizontal, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import RestoreArchivedDocumentForm from './document-restore-form';

interface RestorDocumentActionsProps {
  row: Row<ArchivedDocument>;
}

export default function RestoreDocumentActions({ row }: RestorDocumentActionsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
            <Link href={`/documents/${row.original.id}`} prefetch>
              <Eye />
              <span>View Document</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/documents/${row.original.id}/history`} prefetch>
              <History /> <span>View History</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download /> <span>Download PDF </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsOpen(open => !open)}>
            <RotateCcw /> <span>Restore </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RestoreArchivedDocumentForm document={row.original} onOpenChange={setIsOpen} open={isOpen} />
    </>
  );
}
