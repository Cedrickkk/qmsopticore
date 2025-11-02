import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  total: number;
  growth: number;
  title: string;
  icon: LucideIcon;
  to: string;
  gradient?: string;
}

export function StatsCard({ total, growth, title, icon: Icon, to, gradient = 'from-blue-500 to-indigo-600' }: StatsCardProps) {
  const isPositive = growth >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Link href={to}>
      <Card className="group relative overflow-hidden rounded-xs transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={cn('rounded-full bg-gradient-to-br p-2.5 transition-transform group-hover:scale-110', gradient)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold">{total}</div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <TrendIcon className={cn('h-3 w-3', isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')} />
                <span className={cn('font-semibold', isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                  {isPositive ? '+' : ''}
                  {growth}%
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </div>
            <ArrowUpRight className="text-muted-foreground h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
