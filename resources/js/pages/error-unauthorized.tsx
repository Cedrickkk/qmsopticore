// resources/js/Pages/Errors/Unauthorized.jsx

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';

interface UnauthorizedProps {
  message: string;
  status?: number;
}

export default function Unauthorized({ message }: UnauthorizedProps) {
  return (
    <AppLayout>
      <Head title="Unauthorized" />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-xs bg-white p-8 shadow-md">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <TriangleAlert className="h-8 w-9 text-red-500" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="mb-6 text-center text-sm text-gray-600">{message}</p>
          <div className="flex justify-center">
            <Button asChild className="rounded-xs">
              {/** TODO:  Redirect this to users their specific home route */}
              <Link href="/documents">Return to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
