import { Separator } from '@/components/ui/separator';
import { getActionTitle } from '@/hooks/use-action-title';
import AppLayout from '@/layouts/app-layout';
import { getDocumentStatusBadge } from '@/lib/document-status';
import { BreadcrumbItem } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';

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
      <Head title="Document History" />

      {/* History List */}
      <div className="py-6">
        <div className="space-y-6">
          {workflowLogs.map(log => (
            <div key={log.id} className="space-y-3">
              {/* Main Action */}
              <div>
                <h3 className="text-base leading-tight font-medium text-gray-900">{getActionTitle(log.action)}</h3>
                <div className="mt-1 text-sm text-gray-500">
                  By {log.user.name}
                  <span className="mx-1">•</span>
                  <time>{log.createdAt}</time>
                </div>
              </div>
              {(log.fromStatus || log.toStatus) && log.fromStatus !== log.toStatus && (
                <div className="flex items-center space-x-3 text-sm">
                  {log.fromStatus && getDocumentStatusBadge(log.fromStatus, 'uppercase')}
                  <span className="text-gray-400">→</span>
                  {log.toStatus && getDocumentStatusBadge(log.toStatus, 'uppercase')}
                </div>
              )}
              {/* Notes */}
              {log.notes && <div className="border-l-3 border-gray-300 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">{log.notes}</div>}
              <Separator />
            </div>
          ))}

          {/* Empty state */}
          {workflowLogs.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">No history available for this document.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
