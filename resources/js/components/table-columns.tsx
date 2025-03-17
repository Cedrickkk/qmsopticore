import TableActions from '@/components/table-actions';
import { TableHeaderButton } from '@/components/table-header-button';
import { Badge } from '@/components/ui/badge';
import { type Document } from '@/types/document';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { Download, Eye, History, MoreHorizontal, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

/**
 *
 * !!! IMPORTANT !!!
 *
 * TODO -> REFACTOR THIS INTO A REUSBALE COMPONENTS
 *
 */

const DocumentStatus = {
  APPROVED: 'approved',
  PENDING: 'pending',
  UPDATED: 'updated',
  REJECTED: 'rejected',
} as const;

export const statusConfig = {
  [DocumentStatus.APPROVED]: { variant: 'default', priority: 1 },
  [DocumentStatus.PENDING]: { variant: 'secondary', priority: 2 },
  [DocumentStatus.UPDATED]: { variant: 'outline', priority: 3 },
  [DocumentStatus.REJECTED]: { variant: 'destructive', priority: 4 },
} as const;

export const documentColumns: ColumnDef<Document>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => <TableHeaderButton column={column}>Code</TableHeaderButton>,
    cell: ({ row }) => <div className="font-medium">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <TableHeaderButton column={column}>Title</TableHeaderButton>,
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'category.name',
    header: ({ column }) => <TableHeaderButton column={column}>Category</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.category.name}</div>,
  },
  {
    accessorKey: 'created_by.name',
    header: ({ column }) => <TableHeaderButton column={column}>Created by</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.created_by.name}</div>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <TableHeaderButton column={column}>Status</TableHeaderButton>,
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusConfig;
      return <Badge variant={statusConfig[status].variant}>{status.toLowerCase()}</Badge>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as keyof typeof statusConfig;
      const b = rowB.getValue(columnId) as keyof typeof statusConfig;
      return statusConfig[a].priority - statusConfig[b].priority;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <TableActions row={row} />,
  },
];

export type ArchivedDocument = Document & {
  archived_at: string;
};

export const archiveColumns: ColumnDef<ArchivedDocument>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => <TableHeaderButton column={column}>Code</TableHeaderButton>,
    cell: ({ row }) => <div className="font-medium">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <TableHeaderButton column={column}>Title</TableHeaderButton>,
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'category.name',
    header: ({ column }) => <TableHeaderButton column={column}>Category</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.category.name}</div>,
  },
  {
    accessorKey: 'created_by.name',
    header: ({ column }) => <TableHeaderButton column={column}>Created by</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.created_by.name}</div>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <TableHeaderButton column={column}>Status</TableHeaderButton>,
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusConfig;
      return <Badge variant={statusConfig[status].variant}>{status.toLowerCase()}</Badge>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as keyof typeof statusConfig;
      const b = rowB.getValue(columnId) as keyof typeof statusConfig;
      return statusConfig[a].priority - statusConfig[b].priority;
    },
  },
  {
    accessorKey: 'archived_at',
    header: ({ column }) => <TableHeaderButton column={column}>Archived at</TableHeaderButton>,
    cell: ({ row }) => <div>{format(new Date(row.original.archived_at), 'MMMM d, yyyy')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
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
          <DropdownMenuItem>
            <RotateCcw /> <span>Restore </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
