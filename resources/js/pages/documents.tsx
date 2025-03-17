import { documentColumns } from '@/components/table-columns';
import { TableData } from '@/components/table-data';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';

type PageProps = {
  documents: PaginatedData<Document>;
};

export default function Documents() {
  const { documents } = usePage<PageProps>().props;
  return (
    <AppLayout>
      <Head title="Documents" />
      <div className="flex h-full flex-1 flex-col gap-4">
        <TableData columns={documentColumns} data={documents} />
      </div>
    </AppLayout>
  );
}
