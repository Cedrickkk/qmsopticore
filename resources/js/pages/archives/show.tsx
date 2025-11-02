import { DocumentInfo, DocumentSignatory } from '@/components/document-info';
import DocumentWorkflowHistory from '@/components/document-workflow-history';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import UserAccessTable from '@/components/user-access-table';
import { useDownloadDocument } from '@/hooks/use-download-document';
import AppLayout from '@/layouts/app-layout';
import DocumentShowLayout from '@/layouts/documents/document-show-layout';
import { BreadcrumbItem } from '@/types';
import { Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, Bolt, Download, Wrench } from 'lucide-react';

type ArchivedDocumentPageProps = {
  archivedDocument: {
    id: number;
    document_id: number;
    archived_by: { id: number; name: string };
    archived_at: string;
    archive_reason: string;
    document: Document & {
      signatories: DocumentSignatory[];
    };
  };
  file: File;
  canRestore: boolean;
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
  accessPermissions: {
    canManageAccess: boolean;
    canRevokeAccess: boolean;
    isDepartmentAdmin: boolean;
    isSuperAdmin: boolean;
  };
};

export default function Show() {
  const { archivedDocument, accessPermissions, workflowLogs } = usePage<ArchivedDocumentPageProps>().props;
  // const { patch } = useForm();
  const { handleDownload } = useDownloadDocument();

  const document = archivedDocument.document;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Archives',
      href: '/archives',
    },
    {
      title: document.title,
      href: `/archives/${archivedDocument.id}`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${document.title} (Archived)`} />

      <DocumentShowLayout>
        <div>
          <div className="opacity-75">
            <DocumentInfo document={document} />
          </div>
        </div>

        <div className="ml-2.5 flex w-full flex-col gap-2">
          <Card className="rounded-none border-none bg-transparent shadow-none">
            <CardHeader className="px-2 py-3 text-center">
              <CardTitle className="font-medium">Archived Information</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-0">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">Archived by:</Label>
                  <span className="text-sm font-medium">{archivedDocument.archived_by.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">Archived At:</Label>
                  <span className="text-sm">{archivedDocument.archived_at}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <Label className="text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">Reason:</Label>
                  <span className="text-start text-sm break-words">{archivedDocument.archive_reason || 'No reason provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Notice */}
          <Alert className="mt-1 rounded-sm border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              This is an archived document. Some features may be limited. Restore the document to enable full functionality.
            </AlertDescription>
          </Alert>

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
        </div>
      </DocumentShowLayout>
    </AppLayout>
  );
}
