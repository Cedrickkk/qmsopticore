import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { Head, router } from '@inertiajs/react';
import { Database, File, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const [isCreatingDbBackup, setIsCreatingDbBackup] = useState(false);

  const handleCreateDatabaseBackup = () => {
    setIsCreatingDbBackup(true);
    router.post(
      route('system-settings.backups.database.create'),
      {},
      {
        onSuccess: () => setIsCreatingDbBackup(false),
        onError: () => setIsCreatingDbBackup(false),
        showProgress: false,
      }
    );
  };

  return (
    <AppLayout>
      <Head title="System Settings" />
      <SystemSettingsLayout>
        <div className="w-full">
          <HeadingSmall
            title="System Dashboard"
            description="Monitor system, perform maintenance tasks, and configure core settings from one centralized interface."
          />

          <Separator className="my-8" />

          {/* Maintenance Section */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h3>Maintenance</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">Toggle maintenance mode and clear system cache.</p>
            <div className="flex gap-4">
              <Button size="sm" variant="outline" className="rounded-xs">
                Toggle Maintenance
              </Button>
              <Button size="sm" variant="outline" className="rounded-xs">
                Clear Cache
              </Button>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Database Section */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              <h3>Database</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">Create a new backup of your database.</p>
            <Button size="sm" className="rounded-xs" onClick={handleCreateDatabaseBackup} disabled={isCreatingDbBackup}>
              {isCreatingDbBackup ? 'Creating Database Backup...' : 'Create Database Backup'}
            </Button>
          </div>

          <Separator className="my-8" />

          {/* Documents Section */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <File className="h-5 w-5" />
              <h3>Documents</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">Create a new backup of all system documents.</p>
            <Button size="sm" className="rounded-xs">
              Create Documents Backup
            </Button>
          </div>
        </div>
      </SystemSettingsLayout>
    </AppLayout>
  );
}
