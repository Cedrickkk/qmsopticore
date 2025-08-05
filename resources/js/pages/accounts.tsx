import AccountsTableActions from '@/components/accounts-table-actions';
import { TableHeaderButton } from '@/components/table-header-button';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { getOnlineStatusBadge } from '@/lib/online-status';
import { PaginatedData, User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
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
import { Settings2, UserPlus } from 'lucide-react';
import { useState } from 'react';

type PageProps = {
  accounts: PaginatedData<User>;
};

export type UserWithDepartment = User & {
  department: {
    id: number;
    name: string;
  };
  online_status: string;
};

export const accountColumns: ColumnDef<UserWithDepartment>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <TableHeaderButton column={column}>Name</TableHeaderButton>,
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <TableHeaderButton column={column}>Email</TableHeaderButton>,
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'position',
    header: ({ column }) => <TableHeaderButton column={column}>Position</TableHeaderButton>,
    cell: ({ row }) => <div>{row.getValue('position')}</div>,
  },
  {
    accessorKey: 'department.name',
    header: ({ column }) => <TableHeaderButton column={column}>Department</TableHeaderButton>,
    cell: ({ row }) => <div>{row.original.department.name}</div>,
  },
  {
    accessorKey: 'online_status',
    header: ({ column }) => <TableHeaderButton column={column}>Status</TableHeaderButton>,
    cell: ({ row }) => getOnlineStatusBadge(row.original.online_status),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <AccountsTableActions row={row} />,
  },
];

export default function Accounts() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const { accounts } = usePage<PageProps>().props;

  const table = useReactTable<UserWithDepartment>({
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    columns: accountColumns,
    data: accounts.data as UserWithDepartment[],
    manualPagination: true,
    pageCount: accounts.last_page,
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
      <Head title="Accounts" />

      <div className="my-5 border-b pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground mt-1">Assign user roles and manage system access permissions</p>
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
                placeholder={'Search accounts...'}
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="w-full rounded-xs"
              />
            </div>
            <div className="flex items-end gap-3">
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

          <Button className="rounded-xs" asChild>
            <Link href="/accounts/create">
              <UserPlus /> New Account
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
                  <TableCell colSpan={accountColumns.length} className="h-16">
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-medium">{noResultsMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination data={accounts} />
      </div>
    </AppLayout>
  );
}
