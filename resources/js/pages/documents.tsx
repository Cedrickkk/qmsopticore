import PaginationLink from '@/components/pagination-link';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PaginatedData } from '@/types';
import { type Document } from '@/types/document';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Documents() {
  const { documents } = usePage<{ documents: PaginatedData<Document> }>().props;

  return (
    <AppLayout>
      <Head title="Documents" />
      <div className="flex h-full flex-1 flex-col justify-center gap-4">
        <div>
          <Table className="rounded-lg border">
            <TableHeader className="bg-primary dark:bg-[var(--primary-light)]!">
              <TableRow className="hover:bg-primary text-right dark:hover:bg-[var(--primary-light)]!">
                <TableHead className="black p-4 text-white">Code</TableHead>
                <TableHead className="black p-4 text-white">Title</TableHead>
                <TableHead className="black p-4 text-white">Type</TableHead>
                <TableHead className="black p-4 text-white">Status</TableHead>
                <TableHead className="black p-4 text-white">Created by</TableHead>
                <TableHead className="p-4 text-right text-white">Updated at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.data.map(document => (
                <TableRow key={document.id}>
                  <TableCell className="p-4 font-medium">{document.code}</TableCell>
                  <TableCell className="p-4">
                    <Link href={route('documents.show', document.id)} className="hover:underline">
                      {document.title}
                    </Link>
                  </TableCell>
                  <TableCell className="p-4">{document.category.name}</TableCell>
                  <TableCell className="p-4">{document.creator.name}</TableCell>
                  <TableCell className="p-4">
                    <Badge variant="secondary"> {document.status}</Badge>
                  </TableCell>
                  <TableCell className="p-4 text-right">{new Date(document.updated_at).toLocaleDateString('en-US')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground text-xs">
            Showing {documents?.data?.length} of {documents?.total}
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="w-full text-xs font-medium">
              Page {documents?.current_page} of {documents?.last_page}
            </div>

            <Pagination>
              <PaginationContent>
                {documents?.links.map((link, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink link={link} className="text-xs" />
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
