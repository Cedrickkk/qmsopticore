import DocumentActivityChart from '@/components/document-activity-chart';
import RecentDocuments from '@/components/recent-documents';
import TotalDocuments from '@/components/total-documents';
import TotalUsers from '@/components/total-users';
import AppLayout from '@/layouts/app-layout';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';

export const description = 'An interactive bar chart';

export default function Dashboard() {
  const { totalDocuments, totalUsers, userDocuments } = usePage<{ totalDocuments: number; totalUsers: number; userDocuments: Document[] }>().props;

  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="mt-12 flex min-h-full flex-col justify-center gap-4 overflow-hidden scroll-smooth">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid w-full grid-flow-row auto-rows-max gap-4 xl:grid-cols-2">
            <TotalDocuments totalDocuments={totalDocuments} />
            <TotalUsers totalUsers={totalUsers} />
            <div className="col-span-2 flex">
              <DocumentActivityChart />
            </div>
          </div>
          <RecentDocuments documents={userDocuments} />
        </div>
      </div>
    </AppLayout>
  );
}
