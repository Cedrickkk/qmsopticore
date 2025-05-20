import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { statusConfig } from '@/pages/documents';
import { type Document } from '@/types/document';
import { router } from '@inertiajs/react';
import { FileStack } from 'lucide-react';

type RecentDocumentsProps = {
  documents: Document[] | undefined;
};

export default function RecentDocuments({ documents }: RecentDocumentsProps) {
  const handleShow = (document: Document) => {
    router.get(route('documents.show', document.id));
  };

  return (
    <Card className="relative h-fit w-full overflow-hidden rounded-xs">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl font-bold">
          <span>Recent Documents</span>
          <span>
            <FileStack className="size-7" />
          </span>
        </CardTitle>
        <CardDescription>A list of your recent documents</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Table className="mb-4 h-full">
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map(document => (
              <TableRow key={document.id} onClick={() => handleShow(document)} className="cursor-pointer">
                <TableCell>
                  <div className="font-medium">{document.created_by.name}</div>
                  <div className="text-muted-foreground hidden text-sm md:inline">{document.created_by.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground hidden text-sm md:inline">{document.category.name}</div>
                </TableCell>
                <TableCell className="text-right sm:table-cell">
                  <div className="flex items-center justify-end">
                    <Badge className="text-xs" variant={statusConfig[document.status as keyof typeof statusConfig].variant}>
                      {document.status}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
