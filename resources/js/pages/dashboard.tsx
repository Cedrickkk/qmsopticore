import DocumentActivityChart from '@/components/document-activity-chart';
import RecentDocuments from '@/components/recent-documents';
import { StatsCard } from '@/components/stats-card';
import AppLayout from '@/layouts/app-layout';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { FileText, Users } from 'lucide-react';

type DashboardProps = {
  totalDocuments: number;
  totalUsers: number;
  userRecentDocuments: Document[];
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
  const { totalDocuments, totalUsers, userRecentDocuments, stats } = usePage<DashboardProps>().props;
  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="flex min-h-full flex-col gap-4 overflow-hidden scroll-smooth">
        <div className="flex flex-col-reverse gap-4 lg:grid lg:grid-cols-2">
          <div className="grid w-full grid-flow-row auto-rows-max gap-4 xl:grid-cols-2">
            <StatsCard total={totalDocuments} growth={stats.documentsGrowth} title="Total Documents" icon={FileText} to={route('documents.index')} />
            <StatsCard total={totalUsers} growth={stats.usersGrowth} title="Total Users" icon={Users} to={route('accounts.index')} />
            <div className="col-span-2 flex">
              <DocumentActivityChart data={stats.documentActivity} />
            </div>
          </div>
          <RecentDocuments documents={userRecentDocuments} />
        </div>
      </div>
    </AppLayout>
  );
}
