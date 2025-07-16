import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { FileStack } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface DocumentActivity {
  week: string;
  count: number;
  yearWeek: string;
}

interface DocumentActivityChartProps {
  data: DocumentActivity[];
}

const chartConfig = {
  desktop: {
    label: 'Downloads',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export default function DocumentActivityChart({ data }: DocumentActivityChartProps) {
  const currentMonth = data[1] ?? data[0];
  const previousMonth = data[0];

  const calculateGrowth = () => {
    if (!previousMonth || !currentMonth) return 0;
    const growth = ((currentMonth.count - previousMonth.count) / previousMonth.count) * 100;
    return Math.round(growth * 10) / 10;
  };

  const chartData = data.map(item => ({
    month: item.week,
    documents: item.count,
  }));

  return (
    <Card className="h-fit w-full rounded-xs transition duration-300 ease-linear">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl font-bold">
          <span>Document Overview</span>
          <span>
            <FileStack className="size-7" />
          </span>
        </CardTitle>
        <CardDescription>Weekly document creation</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="documents"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none">
              <span className="font-medium">{currentMonth?.week}</span>
              <span className={cn('font-bold', calculateGrowth() >= 0 ? 'text-primary' : 'text-red-600')}>
                {calculateGrowth() >= 0 ? '+' : ''}
                {calculateGrowth()}%
              </span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
