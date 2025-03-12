import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebouncedSearch } from '@/hooks/use-search';
import { PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';
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
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: PaginatedData<TData>;
}

/**
 *
 * TODO: Figure out what is the best approach for live search with the current tech stack.
 *
 */

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  /**
   *
   * Global filtering only on current page
   *
   */

  const [globalFilter, setGlobalFilter] = useState<string>('');

  /**
   *
   * Debouncing approach for documents search
   *
   */
  const { search, handleSearch, isProcessing } = useDebouncedSearch();

  const table = useReactTable({
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    columns,
    data: data.data,
    manualPagination: true,
    manualFiltering: true,
    pageCount: data.last_page,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  const noResultsMessage = globalFilter ? `No results found for "${globalFilter}"` : 'No documents available';

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/** Debounce search input */}
          <Input placeholder="Search documents..." value={search} onChange={event => handleSearch(event.target.value)} className="max-w-lg" />

          {/** Global filtering input */}
          {/* <Input
            placeholder="Filter documents..."
            value={globalFilter ?? ''}
            onChange={event => setGlobalFilter(event.target.value)}
            className="max-w-lg"
          /> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto rounded-sm">
                Columns
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
        <Button asChild>
          <Link href="/documents/create">Create New Document</Link>
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
            {isProcessing ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-16">
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircle className="text-muted-foreground h-6 w-6 animate-spin" />
                    <p className="text-muted-foreground text-sm">Searching documents...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
                <TableCell colSpan={columns.length} className="h-16">
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium">{noResultsMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination data={data} />
    </>
  );
}
