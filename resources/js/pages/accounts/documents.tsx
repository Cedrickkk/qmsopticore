import { TablePagination } from '@/components/table-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileLayout, { UserProfile } from '@/layouts/accounts/account-profile-layout';
import { getDocumentAssociationBadge } from '@/lib/document-association';
import { getDocumentStatusBadge } from '@/lib/document-status';
import { PaginatedData } from '@/types';
import { Document } from '@/types/document';
import { usePage } from '@inertiajs/react';

type AuthorizeDocuments = Document & {
  user_association: string;
};

type PageProps = {
  user: UserProfile;
  authorized_documents: PaginatedData<AuthorizeDocuments>;
};

export default function Documents() {
  const { user, authorized_documents } = usePage<PageProps>().props;

  return (
    <UserProfileLayout user={user} activeTab="documents">
      <div className="space-y-6">
        <Card className="rounded-xs border-none shadow-none">
          <CardHeader>
            <CardTitle>Documents & Access</CardTitle>
            <CardDescription>Documents created, received, or requiring user signatures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {authorized_documents.data.map(document => (
                <div key={document.id} className="flex items-start space-x-3 border-b border-gray-100 px-3 pb-4 last:border-b-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{document.title}</p>
                        <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                          <span>{document.code}</span>
                          <span>•</span>
                          <span>v{document.version}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">{document.category.name}</div>
                        <div className="mt-1 text-xs text-gray-400">{getDocumentStatusBadge(document.status)}</div>
                      </div>
                      <div className="ml-4 flex-shrink-0">{getDocumentAssociationBadge(document.user_association)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <TablePagination data={authorized_documents} />
            </div>
          </CardContent>
        </Card>
      </div>
    </UserProfileLayout>
  );
}
