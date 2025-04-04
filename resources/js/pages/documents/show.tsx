import { ApproveDocumentDialog } from '@/components/approve-document-dialog';
import { DocumentInfo, DocumentSignatory } from '@/components/document-info';
import { PDFViewer } from '@/components/document-viewer';
import { RejectDocumentDialog } from '@/components/reject-document-dialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { type Document } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { File } from 'react-pdf/dist/esm/shared/types.js';

type PageProps = {
  file: File;
  document: Document & {
    signatories: DocumentSignatory[];
  };
  signatory: boolean;
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
      <Head title="Documents" />

      {canSign && (
        <div className="mt-4 flex gap-2">
          <Button variant="default" onClick={() => setShowApproveModal(true)}>
            Approve Document
          </Button>
          <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
            Reject Document
          </Button>
        </div>
      )}

      {isNextSignatory && !canSign && (
        <p className="text-muted-foreground mt-4">
          Waiting for {isNextSignatory.name} to sign (Signatory #{isNextSignatory.order})
        </p>
      )}

      <ApproveDocumentDialog isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} documentId={document.id} />
      <RejectDocumentDialog isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} documentId={document.id} />
      <DocumentInfo document={document} />
      <PDFViewer file={file} showThumbnails={true} />
    </AppLayout>
  );
}
