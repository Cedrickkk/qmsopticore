import { PDFViewer } from '@/components/document-viewer';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { File } from 'react-pdf/dist/esm/shared/types.js';

type PageProps = {
  file: File;
  document: Document;
};

export default function Show() {
  const { file, document } = usePage<PageProps>().props;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Documents',
      href: '/documents',
    },
    {
      title: document.title,
      href: `/documents/${document.id}`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Documents" />
      <PDFViewer file={file} showThumbnails={true} />
    </AppLayout>
  );
}
