import DocumentArchiveForm from '@/components/document-archive-form';
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
import { ArchiveX, Download, Eye, History, MoreHorizontal, Send } from 'lucide-react';
import { useState } from 'react';

interface TableActionsProps {
  row: Row<Document>;
}

export default function TableActions({ row }: TableActionsProps) {
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDownload(row.original)}>
            <Download /> <span>Download PDF </span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Send />
            <span>Share Document</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setIsOpen(open => !open)}>
            <ArchiveX className="text-destructive" />
            <span>Archive Document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DocumentArchiveForm open={isOpen} onOpenChange={setIsOpen} document={row.original} />
    </>
  );
}
