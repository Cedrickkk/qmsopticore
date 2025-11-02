import { AccountOverview } from '@/components/account-overview';
import DocumentActivityChart from '@/components/document-activity-chart';
import RecentDocuments from '@/components/recent-documents';
import { StatsCard } from '@/components/stats-card';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { FileText, Users } from 'lucide-react';

type DashboardProps = {
  totalDocuments: number;
  totalUsers: number;
  userRecentDocuments: Document[];
  departmentDistribution: Array<{
    department: {
      name: string;
      code: string;
    };
    users: number;
    fill: string;
  }>;
  stats: {
    documentsGrowth: number;
    usersGrowth: number;
    documentActivity: Array<{
      week: string;
      count: number;
      yearWeek: string;
    }>;
  };
};

export default function Dashboard() {
  const { totalDocuments, totalUsers, userRecentDocuments, stats, departmentDistribution } = usePage<DashboardProps>().props;
  const { auth } = usePage<SharedData>().props;

  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="flex min-h-full flex-col gap-4 overflow-hidden scroll-smooth">
        <div className="my-6">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {auth.user.name}!</h1>
          <p className="text-muted-foreground mt-1 text-sm">Here's what's happening with your documents today.</p>
        </div>

        <div className="flex flex-col-reverse gap-4 lg:grid lg:grid-cols-2">
          <div className="grid w-full grid-flow-row auto-rows-max gap-4 xl:grid-cols-2">
            <StatsCard
              total={totalDocuments}
              growth={stats.documentsGrowth}
              title="Total Documents"
              icon={FileText}
              to={route('documents.index')}
              gradient="from-indigo-500 to-purple-600"
            />
            <StatsCard
              total={totalUsers}
              growth={stats.usersGrowth}
              title="Total Users"
              icon={Users}
              to={route('accounts.index')}
              gradient="from-blue-500 to-cyan-600"
            />
            <div className="col-span-2 flex flex-col gap-4">
              <DocumentActivityChart data={stats.documentActivity} />
              <AccountOverview data={departmentDistribution} />
            </div>
          </div>
          <RecentDocuments documents={userRecentDocuments} />
        </div>
      </div>
    </AppLayout>
  );
}
