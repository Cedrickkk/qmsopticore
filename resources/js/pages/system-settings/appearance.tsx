import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { Head } from '@inertiajs/react';

export default function Appearance() {
  return (
    <AppLayout>
      <Head title="System Appearance" />
      <SystemSettingsLayout>
        <HeadingSmall title="System Appearance" description="Customize the visual aspects, including themes, colors, and branding options." />
      </SystemSettingsLayout>
    </AppLayout>
  );
}
