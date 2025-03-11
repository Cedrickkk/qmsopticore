import { PDFViewer } from '@/components/pdf-viewer';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { File } from 'react-pdf/dist/esm/shared/types.js';

type PageProps = {
  file: File;
  document: {
    title: string;
    code: string;
  };
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
      href: window.location.pathname,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Documents" />
      <PDFViewer file={file} showThumbnails={true} />
    </AppLayout>
  );
}
