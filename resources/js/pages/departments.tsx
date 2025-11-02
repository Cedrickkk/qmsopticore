import DepartmentTableActions from '@/components/departments-table-actions';
import { TableHeaderButton } from '@/components/table-header-button';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';

export type Department = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  users_count?: number;
  documents_count?: number;
  active_users_count?: number;
  admins: [{ id: number; name: string; email: string; position: string }];
  created_at?: string;
  updated_at?: string;
};

type PageProps = {
  departments: PaginatedData<Department>;
};

export const departmentColumns: ColumnDef<Department>[] = [
  {
    accessorKey: 'code',
    header: ({ column, table }) => (
      <div className="ml-1.5 flex items-center gap-2">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="data-[state=checked]:text-primary border-white data-[state=checked]:bg-white"
        />
        <TableHeaderButton column={column}>Code</TableHeaderButton>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Checkbox checked={row.getIsSelected()} onCheckedChange={value => row.toggleSelected(!!value)} aria-label="Select row" />
        <div className="font-medium">{row.getValue('code')}</div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <TableHeaderButton column={column}>Title</TableHeaderButton>,
    cell: ({ row }) => <div className="max-w-11/12 truncate">{row.original.name}</div>,
  },
  {
    accessorKey: 'admins',
    header: ({ column }) => <TableHeaderButton column={column}>Administrators</TableHeaderButton>,
    cell: ({ row }) => {
      const admins = row.original.admins;

      if (!admins.length) {
        return <div className="text-muted-foreground text-sm italic">No admin assigned</div>;
      }

      return (
        <div className="flex flex-col gap-2">
          {admins.map(admin => (
            <div key={admin.id} className="flex flex-col">
              <div className="text-sm font-medium">{admin.name}</div>
              <span className="text-muted-foreground text-xs">{admin.email}</span>
              {admin.position && <span className="text-muted-foreground text-xs">{admin.position}</span>}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'users_count',
    header: ({ column }) => <TableHeaderButton column={column}>Users</TableHeaderButton>,
    cell: ({ row }) => (
      <div className="flex flex-col items-center">
        <div className="text-center font-medium">{row.original.users_count || 0}</div>
        {row.original.active_users_count !== undefined && (
          <div className="text-muted-foreground text-xs">{row.original.active_users_count} active</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'documents_count',
    header: ({ column }) => <TableHeaderButton column={column}>Documents</TableHeaderButton>,
    cell: ({ row }) => <div className="text-center">{row.original.documents_count || 0}</div>,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <TableHeaderButton column={column}>Created</TableHeaderButton>,
    cell: ({ row }) => <div className="text-sm">{row.original.created_at}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <DepartmentTableActions row={row} />,
  },
];

export default function Departments() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { departments } = usePage<PageProps>().props;
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const table = useReactTable({
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
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
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedDepartmentIds = selectedRows.map(row => row.original.id);

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
          {/* <Button asChild>
            <Link href="/departments/create" className="items-center rounded-xs">
              <Building2 />
              New Department
            </Link>
          </Button> */}
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col gap-4">
        <div className="flex items-end justify-between">
          <div className="flex w-full items-end gap-3">
            <div className="flex w-1/2 flex-col gap-3">
              <Label htmlFor="search" className="px-1">
                Search
              </Label>
              <Input
                id="search"
                placeholder={'Search department...'}
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="w-full rounded-xs"
              />
            </div>

            {selectedDepartmentIds.length > 0 && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span className="font-medium">{selectedDepartmentIds.length}</span>
                <span>selected</span>
              </div>
            )}

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
                        {column.id
                          .replace(/_count$/, '')
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
