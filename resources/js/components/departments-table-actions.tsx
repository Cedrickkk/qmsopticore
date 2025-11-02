import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Department } from '@/pages/departments';
import { Link } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { Eye, MoreHorizontal } from 'lucide-react';

interface DepartmentTableActionsProps {
  row: Row<Department>;
}

export default function DepartmentTableActions({ row }: DepartmentTableActionsProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-sm">
          <DropdownMenuLabel>Department Actions</DropdownMenuLabel>

          {/* View & Analytics */}
          <DropdownMenuItem asChild>
            <Link href={`/departments/${row.original.id}`}>
              <Eye />
              <span>View Overview</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive/Delete Modals would go here */}
    </>
  );
}
