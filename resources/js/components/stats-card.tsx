import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  total: number | undefined;
  growth: number;
  title: string;
  icon: LucideIcon;
}

export function StatsCard({ total, growth, title, icon: Icon }: StatsCardProps) {
  const isPositiveGrowth = growth >= 0;

  return (
    <Card className="col-span-2 rounded-xs transition duration-300 ease-linear hover:bg-gray-50 xl:col-span-1 dark:hover:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl font-bold">
          <span>{total}</span>
          <span>
            <Icon className="size-7" />
          </span>
        </CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={cn('text-sm font-medium', isPositiveGrowth ? 'text-primary dark:text-primary' : 'text-red-600 dark:text-red-400')}>
          <span className="font-bold">
            {isPositiveGrowth ? '+' : ''}
            {growth}%
          </span>{' '}
          from last month
        </p>
      </CardContent>
    </Card>
  );
}
