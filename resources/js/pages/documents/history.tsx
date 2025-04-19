import LogIcon from '@/components/document-log-icon';
import StatusChange from '@/components/document-status-change';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getActionTitle } from '@/hooks/use-action-title';
import AppLayout from '@/layouts/app-layout';
import { statusConfig } from '@/pages/documents';
import { BreadcrumbItem } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';

type PageProps = {
  document: Document;
  workflowLogs: Array<{
    id: number;
    action: string;
    fromStatus: string | null;
    toStatus: string | null;
    notes: string | null;
    createdAt: string;
    user: {
      id: number;
      name: string;
      avatar: string | null;
    };
  }>;
};

export default function DocumentHistory() {
  const { document, workflowLogs } = usePage<PageProps>().props;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Documents',
      href: '/documents',
    },
    {
      title: document.title,
      href: `/documents/${document.id}`,
    },
    {
      title: 'History',
      href: `/documents/${document.id}/history`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Documents" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Document History</h2>
        </div>

        <ScrollArea className="h-[700px] pr-4">
          <ol className="relative ml-4 border-l border-gray-200 dark:border-gray-700">
            {workflowLogs.map(log => (
              <li key={log.id} className="mb-8 ml-8">
                <LogIcon action={log.action} />
                <div className="space-y-3">
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                      {getActionTitle(log.action)}
                      {log.toStatus && typeof log.toStatus === 'string' && log.toStatus in statusConfig && (
                        <Badge variant={statusConfig[log.toStatus as keyof typeof statusConfig].variant} className="ml-2">
                          {statusConfig[log.toStatus as keyof typeof statusConfig].label}
                        </Badge>
                      )}
                    </h3>
                    <div className="mb-2 flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{log.user.name}</span>
                      <span>•</span>
                      <time className="font-normal">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</time>
                    </div>
                  </div>

                  {(log.fromStatus || log.toStatus) && log.fromStatus !== log.toStatus && <StatusChange from={log.fromStatus} to={log.toStatus} />}

                  {log.notes && (
                    <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">{log.notes}</div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
