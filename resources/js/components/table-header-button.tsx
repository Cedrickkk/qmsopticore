import { Button } from '@/components/ui/button';
import { Column } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

interface TableHeaderButtonProps<TData> {
  column: Column<TData>;
  children: React.ReactNode;
}

export function TableHeaderButton<TData>({ column, children }: TableHeaderButtonProps<TData>) {
  return (
    <Button
      variant="ghost"
      className="cursor-pointer rounded-sm text-white hover:bg-white/10 hover:text-white"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
