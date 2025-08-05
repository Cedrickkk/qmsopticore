import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserWithDepartment } from '@/pages/accounts';
import { User as UserType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { Activity, Files, Key, MoreHorizontal, Trash2, User } from 'lucide-react';

interface AccountsTableActionsProps {
  row: Row<UserWithDepartment>;
}

export default function AccountsTableActions({ row }: AccountsTableActionsProps) {
  const user = row.original;
  const isCurrentUser = user.id === usePage<UserType>().props.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xs">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <Link href={`/accounts/${user.id}`}>
            <User className="h-4 w-4" />
            <span>View Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/accounts/${user.id}/activity`}>
            <Activity />
            <span>View Activity</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/accounts/${user.id}/documents`}>
            <Files />
            <span>View Documents</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/accounts/${user.id}/permissions`}>
            <Key />
            <span>Manage Permissions</span>
          </Link>
        </DropdownMenuItem>

        {!isCurrentUser && (
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="text-destructive dark:text-white" />
            <span>Disable Account</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
