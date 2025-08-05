import DocumentTableActions from '@/components/documents-table-actions';
import { TableHeaderButton } from '@/components/table-header-button';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { getDocumentStatusBadge } from '@/lib/document-status';
import { PaginatedData } from '@/types';
import { type Document } from '@/types/document';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import { ChevronDownIcon, FilePlus2, RotateCcw, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

const DocumentStatus = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const statusConfig = {
  [DocumentStatus.DRAFT]: { variant: 'outline', priority: 5, label: 'Draft' },
  [DocumentStatus.IN_REVIEW]: { variant: 'secondary', priority: 4, label: 'In Review' },
  [DocumentStatus.APPROVED]: { variant: 'default', priority: 3, label: 'Approved' },
  [DocumentStatus.PUBLISHED]: { variant: 'success', priority: 1, label: 'Published' },
  [DocumentStatus.REJECTED]: { variant: 'destructive', priority: 6, label: 'Rejected' },
  [DocumentStatus.ARCHIVED]: { variant: 'outline', priority: 2, label: 'Archived' },
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
    cell: ({ row }) => <div className="max-w-11/12 truncate">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'category.name',
    header: ({ column }) => <TableHeaderButton column={column}>Category</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.category.name}</div>,
  },
  {
    accessorKey: 'created_by.name',
    header: ({ column }) => <TableHeaderButton column={column}>Created By</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.created_by.name}</div>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <TableHeaderButton column={column}>Status</TableHeaderButton>,
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusConfig;
      return getDocumentStatusBadge(status);
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as keyof typeof statusConfig;
      const b = rowB.getValue(columnId) as keyof typeof statusConfig;
      return statusConfig[a].priority - statusConfig[b].priority;
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <TableHeaderButton column={column}>Created At</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.created_at}</div>,
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => <TableHeaderButton column={column}>Last Updated</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.updated_at}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <DocumentTableActions row={row} />,
  },
];

type PageProps = {
  documents: PaginatedData<Document>;
};

export default function Documents() {
  const { documents } = usePage<PageProps>().props;
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [openDateRange, setOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const table = useReactTable({
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    columns: documentColumns,
    data: documents.data,
    manualPagination: true,
    pageCount: documents.last_page,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  const noResultsMessage = globalFilter ? `No results found for "${globalFilter}"` : 'No documents available';

  const handleDateFilter = () => {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    router.get(
      '/documents',
      {
        search: globalFilter,
        date_from: dateRange?.from ? formatDate(dateRange.from) : null,
        date_to: dateRange?.to ? formatDate(dateRange.to) : null,
      },
      {
        preserveState: true,
        preserveScroll: true,
        preserveUrl: false,
      }
    );
  };

  const handleClearDateFilter = () => {
    setDateRange(undefined);
    router.get('/documents');
  };

  return (
    <AppLayout>
      <Head title="Documents" />

      <div className="my-5 border-b pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="text-muted-foreground mt-1">Access, review, and track document versions and approvals</p>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col gap-4">
        <div className="mb-4 flex items-end justify-between">
          <div className="flex w-3/4 items-end gap-3">
            <div className="flex w-full flex-col gap-3">
              <Label htmlFor="search" className="px-1">
                Search
              </Label>
              <Input
                id="search"
                placeholder={'Search document...'}
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="w-full rounded-xs"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-3">
                <Label htmlFor="dateRange" className="px-1">
                  Date Range
                </Label>
                <Popover open={openDateRange} onOpenChange={setOpenDateRange}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" id="dateRange" className="w-[300px] justify-between rounded-xs font-normal">
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                          </>
                        ) : (
                          dateRange.from.toLocaleDateString()
                        )
                      ) : (
                        'Select date range'
                      )}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="border shadow-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleDateFilter}>
                  Apply
                </Button>
                <Button variant="ghost" onClick={handleClearDateFilter}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-xs">
                      <Settings2 />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-xs">
                    {table
                      .getAllColumns()
                      .filter(column => column.getCanHide())
                      .map(column => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="rounded-xs capitalize"
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
          </div>

          <Button asChild>
            <Link href="/documents/create" className="items-center rounded-xs">
              <FilePlus2 />
              New Document
            </Link>
          </Button>
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
                  <TableCell colSpan={documentColumns.length} className="h-16">
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
      <TablePagination data={documents} />
    </AppLayout>
  );
}
