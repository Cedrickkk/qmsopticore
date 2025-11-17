import { ApprovalStatusBanner } from '@/components/approval-status-banner';
import { ApproveDocumentDialog } from '@/components/approve-document-dialog';
import { DocumentInfo, DocumentSignatory } from '@/components/document-info';
import { DocumentPreviewer } from '@/components/document-previewer';
import DocumentWorkflowHistory from '@/components/document-workflow-history';
import { PasswordDownloadDialog } from '@/components/password-download-dialog';
import { RejectDocumentDialog } from '@/components/reject-document-dialog';
import { RemoveRepresentativeButton } from '@/components/remove-representative-button';
import { SetRepresentativeDialog } from '@/components/set-representative-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import UserAccessTable from '@/components/user-access-table';
import { useDownloadDocument } from '@/hooks/use-download-document';
import AppLayout from '@/layouts/app-layout';
import DocumentShowLayout from '@/layouts/documents/document-show-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { type Document as DocumentType } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { Bolt, Download, GitCommitVertical, PencilLine, Users, Wrench } from 'lucide-react';
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
  confidentiality_level: 'public' | 'internal' | 'confidential';
  require_reauth_on_view: boolean;
  auto_blur_after_seconds: number;
};

export default function Show() {
  const { file, document, canSign, nextSignatory, accessPermissions, workflowLogs } = usePage<PageProps>().props;
  const { handleDownload, isPasswordDialogOpen, handlePasswordCancel, password, setPassword, handlePasswordSubmit, isDownloading, pendingDocument } =
    useDownloadDocument();
  const { auth } = usePage<SharedData>().props;

  const userSignatory = document.signatories?.find(
    sig => (sig.user.id === auth.user.id && sig.status === 'pending') || (sig.representative_user_id === auth.user.id && sig.status === 'pending')
  );

  const isSigningAsRepresentative = userSignatory && userSignatory.representative_user_id === auth.user.id;

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
              <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold">
                <PencilLine className="h-3 w-3" />
                Actions
              </p>
              <Separator className="my-2" />
              {isSigningAsRepresentative && (
                <p className="text-muted-foreground mb-2 text-sm">
                  You are signing on behalf of <span className="text-foreground font-medium">{userSignatory.user.name}</span>
                </p>
              )}
              <div className="flex flex-col gap-2">
                <ApproveDocumentDialog
                  documentId={document.id}
                  isSigningAsRepresentative={isSigningAsRepresentative}
                  representativeFor={isSigningAsRepresentative ? userSignatory.user.name : undefined}
                />
                <RejectDocumentDialog documentId={document.id} />
              </div>
            </div>
          )}
          {userSignatory && !isSigningAsRepresentative && (
            <div className="w-full">
              <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold">
                <Users className="h-3 w-3" />
                Representative
              </p>
              <Separator className="my-2" />
              <div className="flex flex-col gap-2">
                <SetRepresentativeDialog
                  documentId={document.id}
                  currentRepresentative={
                    userSignatory.representative_user_id
                      ? {
                          id: userSignatory.representative_user_id,
                          name: userSignatory.representative_name || 'Representative',
                        }
                      : null
                  }
                />
                {userSignatory.representative_user_id && <RemoveRepresentativeButton documentId={document.id} />}
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
              {/* Pass security props to DocumentPreviewer */}
              <DocumentPreviewer
                file={file}
                confidentiality_level={document.confidentiality_level}
                auto_blur_after_seconds={document.auto_blur_after_seconds}
                requires_reauth_on_view={document.require_reauth_on_view}
              />
            </div>
            {accessPermissions.canManageAccess && (
              <div>
                <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold" aria-disabled>
                  <Bolt className="h-3 w-3" />
                  Settings
                </p>
                <Separator className="my-2" />
                <UserAccessTable document={document} />
              </div>
            )}
            {nextSignatory?.id !== auth.user.id && (
              <div>
                <p className="text-muted-foreground mt-6 mb-1 flex items-center gap-1 text-xs font-semibold" aria-disabled>
                  <GitCommitVertical className="h-3 w-3" />
                  Status
                </p>
                <Separator className="my-2" />
                <ApprovalStatusBanner nextSignatory={nextSignatory} status={document.status} />
              </div>
            )}
          </div>
        </div>
      </DocumentShowLayout>
      <PasswordDownloadDialog
        isOpen={isPasswordDialogOpen}
        onClose={handlePasswordCancel}
        password={password}
        setPassword={setPassword}
        onSubmit={handlePasswordSubmit}
        isDownloading={isDownloading}
        documentTitle={pendingDocument?.title}
      />
    </AppLayout>
  );
}
