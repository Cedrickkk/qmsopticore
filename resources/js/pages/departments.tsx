import { TableHeaderButton } from '@/components/table-header-button';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
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
import { Settings2 } from 'lucide-react';
import { useState } from 'react';

export type Department = {
  id: number;
  name: string;
  admins: [{ id: number; name: string; email: string; position: string }];
};

type PageProps = {
  departments: PaginatedData<Department>;
};

export const departmentColumns: ColumnDef<Department>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <TableHeaderButton column={column}>Department</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: 'admins',
    header: ({ column }) => <TableHeaderButton column={column}>Admin</TableHeaderButton>,
    cell: ({ row }) => {
      const admins = row.original.admins;

      if (!admins.length) {
        return <div className="text-muted-foreground text-sm italic">No admin assigned</div>;
      }

      return (
        <div>
          {admins.map(admin => (
            <div key={admin.id} className="flex flex-col">
              <div className="text-sm font-medium">{admin.name}</div>
              <span className="text-muted-foreground text-xs">{admin.email}</span>
              <div className="mt-1 flex flex-col gap-1.5">
                <span className="text-xs">{admin.position}</span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
];

export default function Departments() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { departments } = usePage<PageProps>().props;
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const table = useReactTable({
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    columns: departmentColumns,
    data: departments.data,
    manualPagination: true,
    pageCount: departments.last_page,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  const noResultsMessage = globalFilter ? `No results found for "${globalFilter}"` : 'No departments available';

  return (
    <AppLayout>
      <Head title="Departments" />

      <div className="my-5 border-b pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
            <p className="text-muted-foreground mt-1">Manage department information and administrators</p>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex w-full items-end justify-between gap-3">
            <div className="flex w-1/2 flex-col gap-3">
              <Label>Search</Label>
              <Input
                placeholder={'Search department...'}
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="w-full rounded-xs"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-auto rounded-xs">
                  <Settings2 />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xs">
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
                        {column.id}
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
                  <TableCell colSpan={departmentColumns.length} className="h-16">
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-medium">{noResultsMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination data={departments} />
      </div>
    </AppLayout>
  );
}
