import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { Head, usePage } from '@inertiajs/react';
import { DatabaseBackup, Trash2 } from 'lucide-react';

type DatabaseBackup = {
  id: number;
  user_id: number;
  filename: string;
  path: string;
  successful: boolean;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  backups: DatabaseBackup[];
};

export default function Backups() {
  const { backups } = usePage<PageProps>().props;

  return (
    <AppLayout>
      <Head title="Manage Backups" />
      <SystemSettingsLayout>
        <div className="max-w-5xl">
          <div className="mb-4">
            <HeadingSmall
              title="System Backups & Recovery"
              description="Create, manage, and restore database and document backups to protect critical system data and ensure business continuity."
            />
          </div>
          {backups.length > 0 && (
            <Table className="mb-4 h-full">
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead colSpan={2} className="hidden sm:table-cell">
                    Backed up since
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups?.map(backup => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono font-medium">
                        <DatabaseBackup className="size-5" />
                        <span>{backup.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="sm:table-cell">{backup.created_at}</TableCell>
                    <TableCell className="text-right sm:table-cell">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="rounded-xs">
                          Download
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xs">
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SystemSettingsLayout>
    </AppLayout>
  );
}
