import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { Head } from '@inertiajs/react';

export default function Logs() {
  return (
    <AppLayout>
      <Head title="System Logs" />
      <SystemSettingsLayout>
        <HeadingSmall
          title="System Logs"
          description="View and monitor system activity logs to track changes, troubleshoot issues, and ensure integrity and accountability."
        />
      </SystemSettingsLayout>
    </AppLayout>
  );
}
