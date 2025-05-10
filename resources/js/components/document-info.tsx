import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useInitials } from '@/hooks/use-initials';
import { type Document } from '@/types/document';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarDays, CheckCircle, Clock, FileText, History, Users, XCircle } from 'lucide-react';
import { Button } from './ui/button';

const documentStatusConfig = {
  draft: { variant: 'outline', label: 'Draft' },
  in_review: { variant: 'secondary', label: 'In Review' },
  approved: { variant: 'default', label: 'Approved' },
  rejected: { variant: 'destructive', label: 'Rejected' },
  published: { variant: 'success', label: 'Published' },
  archived: { variant: 'outline', label: 'Archived' },
} as const;

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
  const getInitials = useInitials();
  return (
    <>
      <div className="space-y-4 border-b pb-4 lg:col-span-2">
        <Card className="rounded-xs">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{document.title}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{document.category.name}</span>
                  <span>•</span>
                  <span>v{document.version}</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/documents/${document.id}/history`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <History className="h-3.5 w-3.5" />
                    <span>History</span>
                  </Button>
                </Link>
                <Badge
                  variant={documentStatusConfig[document.status as keyof typeof documentStatusConfig]?.variant || 'outline'}
                  className="rounded-sm px-2 py-1"
                >
                  {documentStatusConfig[document.status as keyof typeof documentStatusConfig]?.label || document.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-muted-foreground mb-2 text-sm font-medium">Document Information</h3>
              <div className="rounded-xs border p-3 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">Created by:</span> {document.created_by.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">Created:</span> {format(new Date(document.created_at), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">Last updated:</span>
                    {format(new Date(document.updated_at), 'MMMM d, yyyy')}
                  </div>
                </div>
                <Separator className="my-3" />
                <p className="text-muted-foreground">{document.description}</p>
              </div>
            </div>

            <div>
              <h3 className="text-muted-foreground mb-2 text-sm font-medium">Signatories</h3>
              <div className="rounded-xs border">
                <div className="divide-y">
                  {document.signatories.length === 0 ? (
                    <p className="text-muted-foreground p-3 text-sm">No signatories assigned</p>
                  ) : (
                    document.signatories
                      .sort((a, b) => a.signatory_order - b.signatory_order)
                      .map(signatory => (
                        <div key={signatory.id} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={signatory.user.avatar} />
                              <AvatarFallback>{getInitials(signatory.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{signatory.user.name}</p>
                              <p className="text-muted-foreground text-sm">{signatory.user.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {signatory.status === 'approved' ? (
                              <Badge variant="outline" className="border-green-500 text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approved
                              </Badge>
                            ) : signatory.status === 'rejected' ? (
                              <Badge variant="outline" className="border-red-500 text-red-600">
                                <XCircle className="mr-1 h-3 w-3" />
                                Rejected
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                Pending
                              </Badge>
                            )}
                            {signatory.signed_at && (
                              <span className="text-muted-foreground text-xs">{format(new Date(signatory.signed_at), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
