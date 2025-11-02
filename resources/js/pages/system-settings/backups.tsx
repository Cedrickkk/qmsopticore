import HeadingSmall from '@/components/heading-small';
import { TablePagination } from '@/components/table-pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { BackupServiceApi } from '@/services/app';
import { PaginatedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, CircleCheckBig, Database, DatabaseBackup as DatabaseBackupIcon, Download, File, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type DatabaseBackup = {
  id: number;
  user_id: number;
  type: 'database' | 'document';
  filename: string;
  path: string;
  size: number;
  file_size: string;
  successful: boolean;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  backups: PaginatedData<DatabaseBackup>;
};

export default function Backups() {
  const { backups } = usePage<PageProps>().props;
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [creatingDatabaseBackup, setCreatingDatabaseBackup] = useState(false);
  const [creatingDocumentBackup, setCreatingDocumentBackup] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [backupToDelete, setBackupToDelete] = useState<DatabaseBackup | null>(null);

  const handleCreateDatabaseBackup = async () => {
    setCreatingDatabaseBackup(true);

    const { error } = await BackupServiceApi.createDatabaseBackup();

    if (error) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backup Failed</AlertTitle>
          <AlertDescription>{error || 'Failed to create database backup. Please try again.'}</AlertDescription>
        </Alert>
      );
      setCreatingDatabaseBackup(false);
      return;
    }

    toast(
      <Alert className="border-none p-0 font-sans">
        <DatabaseBackupIcon className="h-4 w-4" color="green" />
        <AlertTitle className="text-primary font-medium">Database Backup Created</AlertTitle>
        <AlertDescription>Database backup created successfully!</AlertDescription>
      </Alert>
    );

    setCreatingDatabaseBackup(false);
    router.reload({ only: ['backups'] });
  };

  const handleCreateDocumentBackup = async () => {
    setCreatingDocumentBackup(true);

    const { error } = await BackupServiceApi.createDocumentBackup();

    if (error) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backup Failed</AlertTitle>
          <AlertDescription>{error || 'Failed to create document backup. Please try again.'}</AlertDescription>
        </Alert>
      );
      setCreatingDocumentBackup(false);
      return;
    }

    toast(
      <Alert className="border-none p-0 font-sans">
        <File className="h-4 w-4" color="green" />
        <AlertTitle className="text-primary font-medium">Document Backup Created</AlertTitle>
        <AlertDescription>Document backup created successfully!</AlertDescription>
      </Alert>
    );

    setCreatingDocumentBackup(false);
    router.reload({ only: ['backups'] });
  };

  const handleDownload = async (backup: DatabaseBackup) => {
    setDownloadingId(backup.id);
    const { data, error } = await BackupServiceApi.download(backup.id);

    if (error) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Uh oh! Something went wrong.</AlertTitle>
          <AlertDescription>{error ? error : 'There was a problem downloading the backup file. Please try again.'}</AlertDescription>
        </Alert>
      );
      setDownloadingId(null);
      return;
    }

    if (data) {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast(
        <Alert className="border-none p-0 font-sans">
          <CircleCheckBig color="green" />
          <AlertTitle className="text-primary font-medium">Backup Download Complete</AlertTitle>
          <AlertDescription>Backup downloaded successfully.</AlertDescription>
        </Alert>
      );

      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!backupToDelete) return;

    setDeletingId(backupToDelete.id);
    const { error } = await BackupServiceApi.delete(backupToDelete.id);

    if (error) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Delete Failed</AlertTitle>
          <AlertDescription>{error || 'Failed to delete backup. Please try again.'}</AlertDescription>
        </Alert>
      );
      setDeletingId(null);
      setBackupToDelete(null);
      return;
    }

    toast(
      <Alert className="border-none p-0 font-sans">
        <CircleCheckBig color="green" />
        <AlertTitle className="text-primary font-medium">Backup Deleted</AlertTitle>
        <AlertDescription>Backup deleted successfully!</AlertDescription>
      </Alert>
    );

    setDeletingId(null);
    setBackupToDelete(null);
    router.reload({ only: ['backups'] });
  };

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

          {/* Backup Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-4">
            <Button size="sm" className="gap-2 rounded-xs" onClick={handleCreateDatabaseBackup} disabled={creatingDatabaseBackup}>
              {creatingDatabaseBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Create Database Backup
            </Button>
            <Button size="sm" variant="outline" className="gap-2 rounded-xs" onClick={handleCreateDocumentBackup} disabled={creatingDocumentBackup}>
              {creatingDocumentBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <File className="h-4 w-4" />}
              Create Document Backup
            </Button>
          </div>

          {backups.data.length > 0 ? (
            <>
              <Table className="mb-4 h-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead className="hidden sm:table-cell">Size</TableHead>
                    <TableHead className="hidden sm:table-cell">Backed up since</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.data.map(backup => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-mono font-medium">
                          {backup.type === 'database' ? <DatabaseBackupIcon className="size-5" /> : <File className="size-5" />}
                          <div className="flex flex-col">
                            <span className="truncate">{backup.filename}</span>
                            <span className="text-muted-foreground text-xs capitalize">{backup.type} Backup</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{backup.file_size}</TableCell>
                      <TableCell className="hidden sm:table-cell">{backup.created_at}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2 rounded-xs"
                            onClick={() => handleDownload(backup)}
                            disabled={downloadingId === backup.id || deletingId === backup.id}
                          >
                            {downloadingId === backup.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xs"
                            onClick={() => setBackupToDelete(backup)}
                            disabled={downloadingId === backup.id || deletingId === backup.id}
                          >
                            {deletingId === backup.id ? (
                              <Loader2 className="text-destructive h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="text-destructive h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination data={backups} />
            </>
          ) : (
            <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm">No backups found. Create your first backup using the buttons above.</p>
            </div>
          )}
        </div>
      </SystemSettingsLayout>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!backupToDelete} onOpenChange={() => setBackupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the backup file{' '}
              <span className="font-mono font-semibold">{backupToDelete?.filename}</span> ({backupToDelete?.file_size}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
