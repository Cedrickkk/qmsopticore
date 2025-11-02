import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityData {
  date: string;
  upload: number;
  download: number;
}

interface DocumentActivityProps {
  data: ActivityData[];
  className?: string;
  initialTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

const chartConfig = {
  activity: {
    label: 'Activity',
  },
  upload: {
    label: 'Uploads',
    color: 'hsl(var(--chart-1))',
  },
  download: {
    label: 'Downloads',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function DocumentActivityChart({ data, className, initialTimeRange = '90d', onTimeRangeChange }: DocumentActivityProps) {
  const [timeRange, setTimeRange] = React.useState(initialTimeRange);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    if (onTimeRangeChange) {
      onTimeRangeChange(value);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Document Activity</CardTitle>
          <CardDescription>Document uploads and downloads over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[160px] rounded-xs sm:ml-auto" aria-label="Select time range">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xs">
            <SelectItem value="90d" className="rounded-xs">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-xs">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-xs">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillUpload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-upload)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-upload)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillDownload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-download)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-download)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="upload" type="natural" fill="url(#fillUpload)" stroke="var(--color-upload)" stackId="a" />
            <Area dataKey="download" type="natural" fill="url(#fillDownload)" stroke="var(--color-download)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
