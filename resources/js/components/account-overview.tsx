import { Users } from 'lucide-react';
import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';

export const description = 'A pie chart with a label';

type DepartmentData = {
  department: {
    name: string;
    code: string;
  };
  users: number;
  fill: string;
};

type AccountOverviewProps = {
  data: DepartmentData[];
};

export function AccountOverview({ data }: AccountOverviewProps) {
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.users - a.users);

    return sorted.map((dept, index) => {
      const chartIndex = index < 4 ? index + 1 : 5;
      return {
        departmentCode: dept.department.code,
        departmentName: dept.department.name,
        users: dept.users,
        fill: `var(--chart-${chartIndex})`,
      };
    });
  }, [data]);

  const totalUsers = useMemo(() => chartData.reduce((acc, curr) => acc + curr.users, 0), [chartData]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      users: {
        label: 'Users',
      },
    };

    chartData.forEach((dept, index) => {
      const chartIndex = index < 4 ? index + 1 : 5;
      config[dept.departmentName] = {
        label: dept.departmentName,
        color: `var(--chart-${chartIndex})`,
      };
    });

    return config;
  }, [chartData]);

  return (
    <Card className="flex flex-col rounded-xs">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Department Distribution
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 transition-transform">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardTitle>
        <CardDescription>User accounts across all departments</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel className="min-w-[220px]" />} />
            <Pie data={chartData} dataKey="users" nameKey="departmentName" label={({ users }) => users} labelLine>
              <LabelList dataKey="departmentCode" className="fill-background" stroke="none" fontSize={12} fontWeight="bold" position="inside" />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total of {totalUsers.toLocaleString()} users across {data.length} departments
        </div>
        <div className="text-muted-foreground leading-none">Showing user distribution by department</div>

        <div className="mt-6 grid w-full grid-cols-2 gap-2">
          {chartData.map((dept, index) => {
            const chartIndex = index < 4 ? index + 1 : 5;
            return (
              <div key={dept.departmentCode} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(var(--chart-${chartIndex}))` }} />
                <span className="text-xs">
                  <span className="font-semibold">{dept.departmentCode}</span> - {dept.departmentName} ({dept.users})
                </span>
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
