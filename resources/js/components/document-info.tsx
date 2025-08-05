import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocumentStatusBadge } from '@/lib/document-status';
import { getSignatoryStatusBadge } from '@/lib/signatory-status';
import { type Document } from '@/types/document';
import { Input } from './ui/input';
import { Label } from './ui/label';

export interface DocumentSignatory {
  id: number;
  user: {
    id: number;
    name: string;
    position: string;
    avatar: string | undefined;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  signed_at: string | null;
  signatory_order: number;
}

interface DocumentInfoProps {
  document: Document & {
    signatories: DocumentSignatory[];
  };
}

export function DocumentInfo({ document }: DocumentInfoProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <Card className="rounded-xs">
          <CardHeader className="px-12 py-6">
            <CardTitle className="text-xl font-semibold text-gray-900">{document.title}</CardTitle>
            <CardDescription>{document.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Card className="rounded-xs border-none shadow-none">
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <CardDescription>Basic information and metadata about this document</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Filename:</Label>
                    </div>
                    <Input className="border-0 text-sm shadow-none ring-0" value={document.title} disabled />
                  </div>
                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Code:</Label>
                    </div>
                    <Input className="border-0 text-sm shadow-none ring-0" value={document.code} disabled />
                  </div>
                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category:</Label>
                    </div>
                    <Input className="border-0 text-sm shadow-none ring-0" value={document.category.name} disabled />
                  </div>
                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Version:</Label>
                    </div>
                    <Input className="border-0 text-sm shadow-none ring-0" value={document.version} disabled />
                  </div>

                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</Label>
                    </div>
                    {getDocumentStatusBadge(document.status)}
                  </div>
                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created By:</Label>
                    </div>
                    <Input className="border-0 text-sm shadow-none ring-0" value={document.created_by.name} disabled />
                  </div>
                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At:</Label>
                    </div>
                    <Input className="border-0 text-sm shadow-none ring-0" value={document.created_at} disabled />
                  </div>
                  <div className="flex items-center px-6 py-4">
                    <div className="w-32 flex-shrink-0">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated:</Label>
                    </div>
                    <Input className="border-0 text-sm shadow-none ring-0" value={document.updated_at} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xs border-none shadow-none">
              <CardHeader>
                <CardTitle>Signatories</CardTitle>
                <CardDescription>Document approvers and their current status</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {document.signatories.length > 0 ? (
                    document.signatories
                      .sort((a, b) => a.signatory_order - b.signatory_order)
                      .map(signatory => (
                        <div key={signatory.id} className="flex items-center px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</Label>
                            <Input className="border-0 text-sm shadow-none ring-0" value={signatory.user.name} disabled />
                          </div>
                          <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</Label>
                            <div className="flex items-center gap-2">{getSignatoryStatusBadge(signatory.status)}</div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex items-center px-6 py-4">
                      <div className="w-32 flex-shrink-0">
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400"> - - - - - - </Label>
                      </div>
                      <Input className="border-0 text-sm shadow-none ring-0" value="No signatories assigned" disabled />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
