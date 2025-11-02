import { TableHeaderButton } from '@/components/table-header-button';
import { TablePagination } from '@/components/table-pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
import { ActivityLog } from '@/types/activity-log';
import { Head, router, usePage } from '@inertiajs/react';
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
import { Activity, ChevronDownIcon, RotateCcw, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

const actionConfig = {
  login: { variant: 'default', label: 'Login', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  logout: { variant: 'outline', label: 'Logout', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  created: { variant: 'success', label: 'Created', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  updated: { variant: 'secondary', label: 'Updated', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  deleted: { variant: 'destructive', label: 'Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  viewed: { variant: 'outline', label: 'Viewed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  downloaded: { variant: 'outline', label: 'Downloaded', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
  approved: { variant: 'success', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  rejected: { variant: 'destructive', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  published: { variant: 'default', label: 'Published', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  archived: { variant: 'outline', label: 'Archived', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
} as const;

export const activityLogColumns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: 'user.name',
    header: ({ column }) => <TableHeaderButton column={column}>User</TableHeaderButton>,
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || ''} alt={user?.name || 'System'} />
            <AvatarFallback className="text-xs">{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user?.name || 'System'}</div>
            {user?.email && <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'action',
    header: ({ column }) => <TableHeaderButton column={column}>Action</TableHeaderButton>,
    cell: ({ row }) => {
      const action = row.getValue('action') as keyof typeof actionConfig;
      const config = actionConfig[action] || { variant: 'outline', label: action, color: 'bg-gray-100 text-gray-800' };

      return (
        <Badge variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline' | 'success'} className={`${config.color} font-medium`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <TableHeaderButton column={column}>Description</TableHeaderButton>,
    cell: ({ row }) => (
      <div className="max-w-md">
        <p className="text-sm">{row.getValue('description')}</p>
      </div>
    ),
  },
  {
    accessorKey: 'entity_type',
    header: ({ column }) => <TableHeaderButton column={column}>Entity</TableHeaderButton>,
    cell: ({ row }) => {
      const entityType = row.getValue('entity_type') as string;
      return entityType ? (
        <Badge variant="outline" className="text-xs">
          {entityType}
        </Badge>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: 'ip_address',
    header: ({ column }) => <TableHeaderButton column={column}>IP Address</TableHeaderButton>,
    cell: ({ row }) => {
      const ip = row.getValue('ip_address') as string;
      return ip ? <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">{ip}</code> : <span className="text-gray-400">-</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <TableHeaderButton column={column}>Timestamp</TableHeaderButton>,
    cell: ({ row }) => <div className="text-sm text-gray-600 dark:text-gray-400">{row.original.created_at}</div>,
  },
];

type PageProps = {
  logs: PaginatedData<ActivityLog>;
  stats: {
    total_activities: number;
    top_actions: Array<{ action: string; count: number }>;
    top_users: Array<{ user: { name: string }; count: number }>;
    daily_activity: Array<{ date: string; count: number }>;
  };
  filters: {
    search?: string;
    action?: string;
    entity_type?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  };
};

export default function ActivityLogs() {
  const { logs, stats, filters } = usePage<PageProps>().props;
  const [globalFilter, setGlobalFilter] = useState<string>(filters.search || '');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [openDateRange, setOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.date_from && filters.date_to
      ? {
          from: new Date(filters.date_from),
          to: new Date(filters.date_to),
        }
      : undefined
  );
  const [selectedAction, setSelectedAction] = useState<string>(filters.action || '');
  const [selectedEntityType, setSelectedEntityType] = useState<string>(filters.entity_type || '');

  const table = useReactTable({
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    columns: activityLogColumns,
    data: logs.data,
    manualPagination: true,
    pageCount: logs.last_page,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  });

  const noResultsMessage = globalFilter ? `No results found for "${globalFilter}"` : 'No activity logs available';

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleFilter = () => {
    router.get(
      '/system-settings/logs',
      {
        search: globalFilter || null,
        action: selectedAction || null,
        entity_type: selectedEntityType || null,
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

  const handleClearFilters = () => {
    setGlobalFilter('');
    setDateRange(undefined);
    setSelectedAction('');
    setSelectedEntityType('');
    router.get('/system-settings/logs');
  };

  return (
    <AppLayout>
      <Head title="Activity Logs" />

      <div className="my-5 border-b pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground mt-1">Monitor user activities and system events</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_activities.toLocaleString()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Activities</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col gap-4">
        <div className="mb-4 flex items-end justify-between">
          <div className="flex w-full items-end gap-3">
            <div className="flex w-full flex-col gap-3">
              <Label htmlFor="search" className="px-1">
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search activities..."
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="w-full rounded-xs"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="action" className="px-1">
                Action
              </Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[180px] rounded-xs">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All actions</SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="entityType" className="px-1">
                Entity Type
              </Label>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger className="w-[180px] rounded-xs">
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All entities</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <Button variant="ghost" onClick={handleFilter}>
                Apply
              </Button>
              <Button variant="ghost" onClick={handleClearFilters}>
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
                  <TableCell colSpan={activityLogColumns.length} className="h-16">
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <Activity className="h-8 w-8" />
                      <p className="text-sm font-medium">{noResultsMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <TablePagination data={logs} />
    </AppLayout>
  );
}
