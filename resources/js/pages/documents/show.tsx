import { ApprovalStatusBanner } from '@/components/approval-status-banner';
import { ApproveDocumentDialog } from '@/components/approve-document-dialog';
import { DocumentInfo, DocumentSignatory } from '@/components/document-info';
import { DocumentPreviewer } from '@/components/document-previewer';
import DocumentWorkflowHistory from '@/components/document-workflow-history';
import { RejectDocumentDialog } from '@/components/reject-document-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import UserAccessTable from '@/components/user-access-table';
import { useDownloadDocument } from '@/hooks/use-download-document';
import AppLayout from '@/layouts/app-layout';
import DocumentShowLayout from '@/layouts/documents/document-show-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { type Document as DocumentType } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { Bolt, Download, GitCommitVertical, PencilLine, Wrench } from 'lucide-react';
import { File } from 'react-pdf/dist/esm/shared/types.js';

type PageProps = {
  file: File;
  document: DocumentType & {
    signatories: DocumentSignatory[];
    recipients?: Array<{
      id: number;
      user: {
        id: number;
        name: string;
        position: string;
        avatar: string | null;
      };
    }>;
  };
  canSign: boolean;
  nextSignatory: {
    id: number;
    order: number;
    name: string;
  } | null;
  accessPermissions: {
    canManageAccess: boolean;
    canRevokeAccess: boolean;
    isDepartmentAdmin: boolean;
    isSuperAdmin: boolean;
  };
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

export default function Show() {
  const { file, document, canSign, nextSignatory, accessPermissions, workflowLogs } = usePage<PageProps>().props;
  const { handleDownload } = useDownloadDocument();
  const { auth } = usePage<SharedData>().props;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Documents',
      href: '/documents',
    },
    {
      title: document.title,
      href: `/documents/${document.id}`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={document.title} />

      <DocumentShowLayout>
        <div>
          <DocumentInfo document={document} />
        </div>
        <div className="flex w-full flex-col flex-wrap items-start justify-center gap-2">
          {canSign && (
            <div className="w-full">
              <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold" aria-disabled>
                <PencilLine className="h-3 w-3" />
                Actions
              </p>
              <Separator className="my-2" />
              <div className="flex flex-col gap-2">
                <ApproveDocumentDialog documentId={document.id} />
                <RejectDocumentDialog documentId={document.id} />
              </div>
            </div>
          )}
          <div className="w-full">
            <div>
              <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold" aria-disabled>
                <Wrench className="h-3 w-3" />
                Tools
              </p>
              <Separator className="my-2" />
              <Button variant="ghost" className="flex w-full items-center justify-start gap-2 rounded-xs" onClick={() => handleDownload(document)}>
                <Download className="h-3 w-3" />
                Download
              </Button>
              <DocumentWorkflowHistory workflowLogs={workflowLogs} />
              <DocumentPreviewer file={file} />
            </div>
            {accessPermissions.canManageAccess && (
              <div>
                <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold" aria-disabled>
                  <Bolt className="h-3 w-3" />
                  Settings
                </p>
                <UserAccessTable document={document} />
                <Separator className="my-2" />
              </div>
            )}
            {nextSignatory?.id !== auth.user.id && (
              <div>
                <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold" aria-disabled>
                  <GitCommitVertical className="h-3 w-3" />
                  Status
                </p>
                <ApprovalStatusBanner nextSignatory={nextSignatory} status={document.status} />
              </div>
            )}
          </div>
        </div>
      </DocumentShowLayout>
    </AppLayout>
  );
}
