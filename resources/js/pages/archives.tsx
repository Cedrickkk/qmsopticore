import RestoreDocumentActions from '@/components/restore-archived-actions';
import { TableHeaderButton } from '@/components/table-header-button';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { statusConfig } from '@/pages/documents';
import { PaginatedData } from '@/types';
import { Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';

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
    cell: ({ row }) => <RestoreDocumentActions row={row} />,
  },
];

type PageProps = {
  archives: PaginatedData<ArchivedDocument>;
};

export default function Archives() {
  const { archives } = usePage<PageProps>().props;
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    columns: archiveColumns,
    data: archives.data,
    manualPagination: true,
    pageCount: archives.last_page,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  const noResultsMessage = globalFilter ? `No results found for "${globalFilter}"` : 'No archived documents available';

  return (
    <AppLayout>
      <Head title="Documents" />
      <div className="flex h-full flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input
              placeholder={'Search document...'}
              value={globalFilter ?? ''}
              onChange={event => setGlobalFilter(event.target.value)}
              className="max-w-lg"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto rounded-sm">
                  <Settings2 /> Filter Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value => column.toggleVisibility(!!value)}
                      >
                        {column.id
                          .replace(/_?name$/, '')
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-sm">
          <Table className="rounded-sm border">
            <TableHeader className="bg-primary rounded-xs dark:bg-[var(--primary-light)]!">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-primary text-right dark:hover:bg-[var(--primary-light)]!">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="black py-3 text-white">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={archiveColumns.length} className="h-16">
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-medium">{noResultsMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <TablePagination data={archives} />
    </AppLayout>
  );
}
