import { archiveColumns, ArchivedDocument } from '@/components/table-columns';
import { TableData } from '@/components/table-data';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type PageProps = {
  archives: PaginatedData<ArchivedDocument>;
};
export default function Archives() {
  const { archives } = usePage<PageProps>().props;
  return (
    <AppLayout>
      <Head title="Documents" />
      <div className="flex h-full flex-1 flex-col gap-4">
        <TableData columns={archiveColumns} data={archives} />
      </div>
    </AppLayout>
  );
}
