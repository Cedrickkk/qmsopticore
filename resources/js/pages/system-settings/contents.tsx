import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { Head } from '@inertiajs/react';

export default function Contents() {
  return (
    <AppLayout>
      <Head title="System Contents" />
      <SystemSettingsLayout>
        <HeadingSmall
          title="System Contents"
          description="Manage and organize the core content, including text, documents, and other informational resources."
        />
      </SystemSettingsLayout>
    </AppLayout>
  );
}
