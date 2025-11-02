import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, ArrowLeft, Building2, CheckCircle2, Clock, FileText, FolderOpen, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

type Admin = {
  id: number;
  name: string;
  email: string;
  position: string | null;
  avatar: string | null;
};

type Department = {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  admins: Admin[];
};

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  documentsGrowth: number;
};

type ChartDataItem = {
  month: string;
  documents: number;
};

type PageProps = {
  department: Department;
  stats: Stats;
  chartData: ChartDataItem[];
};

const chartConfig = {
  documents: {
    label: 'Documents',
    color: '',
  },
  january: {
    label: 'January',
    color: 'var(--chart-1)',
  },
  february: {
    label: 'February',
    color: 'var(--chart-2)',
  },
  march: {
    label: 'March',
    color: 'var(--chart-3)',
  },
  april: {
    label: 'April',
    color: 'var(--chart-4)',
  },
  may: {
    label: 'May',
    color: 'var(--chart-5)',
  },
  june: {
    label: 'June',
    color: 'var(--chart-1)',
  },
  july: {
    label: 'July',
    color: 'var(--chart-2)',
  },
  august: {
    label: 'August',
    color: 'var(--chart-3)',
  },
  september: {
    label: 'September',
    color: 'var(--chart-4)',
  },
  october: {
    label: 'October',
    color: 'var(--chart-5)',
  },
  november: {
    label: 'November',
    color: 'var(--chart-1)',
  },
  december: {
    label: 'December',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function DepartmentShow() {
  const { department, stats, chartData } = usePage<PageProps>().props;

  const id = 'pie-interactive';
  const [activeMonth, setActiveMonth] = useState(chartData[chartData.length - 1]?.month || 'january');

  const enrichedChartData = useMemo(
    () =>
      chartData.map(item => ({
        ...item,
        fill: chartConfig[item.month as keyof typeof chartConfig]?.color || 'var(--chart-1)',
      })),
    [chartData]
  );

  const activeIndex = useMemo(() => chartData.findIndex(item => item.month === activeMonth), [activeMonth, chartData]);
  const months = useMemo(() => chartData.map(item => item.month), [chartData]);

  const approvalRate = stats.totalDocuments > 0 ? Math.round((stats.approvedDocuments / stats.totalDocuments) * 100) : 0;

  return (
    <AppLayout>
      <Head title={`${department.name} - Overview`} />

      {/* Header */}
      <div className="my-6 flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xs">
            <Link href="/departments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="text-muted-foreground h-6 w-6" />
              <h1 className="text-2xl font-semibold tracking-tight">{department.name}</h1>
              <Badge variant="outline" className="font-mono">
                {department.code}
              </Badge>
            </div>
            {department.description && <p className="text-muted-foreground mt-1 text-sm">{department.description}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-muted-foreground text-xs">
                <span className="font-medium text-green-600">{stats.activeUsers} active</span> • {stats.totalUsers - stats.activeUsers} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <div className="rounded-full bg-indigo-100 p-2">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-muted-foreground flex items-center text-xs">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="font-medium text-green-600">
                  {stats.documentsGrowth >= 0 ? '+' : ''}
                  {stats.documentsGrowth}%
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <div className="rounded-full bg-amber-100 p-2">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDocuments}</div>
              <p className="text-muted-foreground text-xs">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="rounded-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-muted-foreground text-xs">
                <span className="font-medium text-green-600">{stats.approvedDocuments} approved</span> •{' '}
                <span className="text-red-600">{stats.rejectedDocuments} rejected</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Information */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Document Activity Chart */}
          <Card data-chart={id} className="flex flex-col rounded-sm">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0">
              <div className="grid gap-1">
                <CardTitle>Document Activity</CardTitle>
                <CardDescription>Monthly document creation trends</CardDescription>
              </div>
              <Select value={activeMonth} onValueChange={setActiveMonth}>
                <SelectTrigger className="ml-auto h-7 w-[130px] rounded-sm pl-2.5" aria-label="Select a month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-sm">
                  {months.map(key => {
                    const config = chartConfig[key as keyof typeof chartConfig];

                    if (!config) {
                      return null;
                    }

                    const color = 'color' in config && typeof config.color === 'string' ? config.color : 'var(--chart-1)';

                    return (
                      <SelectItem key={key} value={key} className="rounded-sm [&_span]:flex">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className="flex h-3 w-3 shrink-0 rounded-xs"
                            style={{
                              backgroundColor: color,
                            }}
                          />
                          {config?.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
              <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={enrichedChartData}
                    dataKey="documents"
                    nameKey="month"
                    innerRadius={60}
                    strokeWidth={5}
                    activeIndex={activeIndex}
                    activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                      <g>
                        <Sector {...props} outerRadius={outerRadius + 10} />
                        <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                      </g>
                    )}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                {chartData[activeIndex]?.documents?.toLocaleString() || 0}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                Documents
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Department Information */}
          <Card className="rounded-sm border-none shadow-none">
            <CardHeader>
              <CardTitle>Department Information</CardTitle>
              <CardDescription>Basic details and metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Department Code</p>
                    <p className="mt-1 font-mono font-semibold">{department.code}</p>
                  </div>
                  <FolderOpen className="text-muted-foreground h-5 w-5" />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Members</p>
                    <p className="mt-1 font-semibold">{stats.totalUsers} users</p>
                  </div>
                  <Users className="text-muted-foreground h-5 w-5" />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Members</p>
                    <p className="mt-1 font-semibold">{stats.activeUsers} users</p>
                  </div>
                  <Activity className="h-5 w-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Created Date</p>
                    <p className="mt-1 font-medium">{department.created_at}</p>
                  </div>
                  <Clock className="text-muted-foreground h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
