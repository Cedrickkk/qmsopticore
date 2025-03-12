import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function Accounts() {
  return (
    <AppLayout>
      <Head title="Accounts" />
      <Button asChild>
        <Link href="/accounts/create" prefetch>
          Create
        </Link>
      </Button>
    </AppLayout>
  );
}
