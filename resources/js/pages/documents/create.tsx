import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Appearance settings',
    href: '/settings/appearance',
  },
];

export default function create() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Documents" />
      <div>
        <p>Hellow</p>
      </div>
    </AppLayout>
  );
}
