import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function index() {
  return (
    <AppLayout>
      <Head title="Documents" />
      <div>
        <p>Hellow from documents</p>
      </div>
    </AppLayout>
  );
}
