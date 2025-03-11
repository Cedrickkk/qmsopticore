import { columns } from '@/components/table-columns';
import { DataTable } from '@/components/table-data';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';

type DocumentsProps = {
  documents: PaginatedData<Document>;
};

export default function Documents() {
  const { documents } = usePage<DocumentsProps>().props;
  return (
    <AppLayout>
      <Head title="Documents" />
      <div className="flex h-full flex-1 flex-col gap-4">
        <DataTable columns={columns} data={documents} />
      </div>
    </AppLayout>
  );
}
