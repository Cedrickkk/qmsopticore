import { ApproveDocumentDialog } from '@/components/approve-document-dialog';
import { DocumentInfo, DocumentSignatory } from '@/components/document-info';
import { PDFViewer } from '@/components/document-viewer';
import { RejectDocumentDialog } from '@/components/reject-document-dialog';
import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserAccessTable from '@/components/user-access-table';
import { useDownloadDocument } from '@/hooks/use-download-document';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { Download, Users } from 'lucide-react';
import { useState } from 'react';
import { File } from 'react-pdf/dist/esm/shared/types.js';

type PageProps = {
  file: File;
  document: Document & {
    signatories: DocumentSignatory[];
  };
  canSign: boolean;
  isNextSignatory: {
    order: number;
    name: string;
  } | null;
};

export default function Show() {
  const { file, document, canSign, isNextSignatory } = usePage<PageProps>().props;
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const { handleDownload } = useDownloadDocument();

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

      <div className="mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <p className="text-muted-foreground">Version {document.version}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowAccessModal(true)} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Access
            </Button>

            <Button variant="outline" className="flex items-center gap-2" onClick={() => handleDownload(document)}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="document" className="w-full rounded-xs">
            <TabsList className="mb-4 rounded-xs">
              <TabsTrigger value="document" className="rounded-xs">
                Document
              </TabsTrigger>
              <TabsTrigger value="info" className="rounded-xs">
                Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="document" className="mt-0">
              {canSign && (
                <div className="mb-4 flex gap-2">
                  <Button variant="default" onClick={() => setShowApproveModal(true)}>
                    Approve Document
                  </Button>
                  <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
                    Reject Document
                  </Button>
                </div>
              )}

              {isNextSignatory && !canSign && (
                <p className="text-muted-foreground mb-4">
                  Waiting for {isNextSignatory.name} to sign (Signatory #{isNextSignatory.order})
                </p>
              )}

              <div className="rounded-xs border p-4">
                <PDFViewer file={file} showThumbnails={true} />
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              <DocumentInfo document={document} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xs">
            <CardHeader className="pb-3">
              <CardTitle>Document Workflow</CardTitle>
              <CardDescription>Approval status and workflow progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span
                    className={`text-sm font-medium ${
                      document.status === 'approved' ? 'text-green-500' : document.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                    }`}
                  >
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created by</span>
                  <span className="text-sm">{document.created_by.name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Category</span>
                  <span className="text-sm">{document.category.name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version</span>
                  <span className="text-sm">{document.version}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Signatories</span>
                  <span className="text-sm">{document.signatories.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xs">
            <CardHeader className="pb-3">
              <CardTitle>Current Signatories</CardTitle>
              <CardDescription>Users who need to approve this document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.signatories.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No signatories assigned</p>
                ) : (
                  document.signatories
                    .sort((a, b) => a.signatory_order - b.signatory_order)
                    .map((signatory, index) => (
                      <div key={signatory.id} className="flex items-center gap-3">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                            signatory.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : signatory.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{signatory.user.name}</p>
                          <p className="text-muted-foreground text-xs">{signatory.user.position}</p>
                        </div>
                        <div>
                          {signatory.status === 'approved' ? (
                            <span className="text-xs font-medium text-green-500">Approved</span>
                          ) : signatory.status === 'rejected' ? (
                            <span className="text-xs font-medium text-red-500">Rejected</span>
                          ) : (
                            <span className="text-xs font-medium text-amber-500">Pending</span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ApproveDocumentDialog isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} documentId={document.id} />

      <RejectDocumentDialog isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} documentId={document.id} />

      <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
        <DialogContent className="max-w-5xl!">
          <AlertDialogHeader>
            <DialogTitle>Manage Document Access</DialogTitle>
            <DialogDescription>Control who can view and interact with "{document.title}"</DialogDescription>
          </AlertDialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <UserAccessTable document={document} />
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowAccessModal(false)}>
              Close
            </Button>
          </AlertDialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
