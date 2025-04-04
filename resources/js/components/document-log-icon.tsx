import { cn } from '@/lib/utils';
import { CalendarDays, FileText, Pencil } from 'lucide-react';

export default function tLogIcon({ action }: { action: string }) {
  const getIconConfig = (action: string) => {
    switch (action) {
      case 'created':
        return {
          icon: FileText,
          iconClass: 'text-green-600',
          bgClass: 'bg-green-100',
        };
      case 'updated':
        return {
          icon: Pencil,
          iconClass: 'text-blue-600',
          bgClass: 'bg-blue-100',
        };
      case 'status_changed':
        return {
          icon: CalendarDays,
          iconClass: 'text-amber-600',
          bgClass: 'bg-amber-100',
        };
      default:
        return {
          icon: CalendarDays,
          iconClass: 'text-gray-600',
          bgClass: 'bg-gray-100',
        };
    }
  };

  const { icon: Icon, iconClass, bgClass } = getIconConfig(action);

  return (
    <span className={cn('absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white', bgClass)}>
      <Icon className={cn('h-4 w-4', iconClass)} />
    </span>
  );
}
