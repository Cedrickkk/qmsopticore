import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { Head } from '@inertiajs/react';

export default function Documents() {
  return (
    <AppLayout>
      <Head title="System Documents" />
      <SystemSettingsLayout>
        <HeadingSmall title="System Documents" description="Manage, organize, and configure the documents, including policies, and records." />
      </SystemSettingsLayout>
    </AppLayout>
  );
}
