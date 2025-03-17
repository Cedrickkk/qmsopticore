import { statusConfig } from '@/components/table-columns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Document } from '@/types/document';
import { format } from 'date-fns';
import { Download, PenLine } from 'lucide-react';

interface DocumentInfoProps {
  document: Document;
}

export function DocumentInfo({ document }: DocumentInfoProps) {
  return (
    <div className="space-y-4 border-b pb-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{document.title}</h2>
          <p className="text-muted-foreground text-xs">
            Code No: <span className="font-medium">{document.code}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            Version No: <span className="font-medium">{document.version}</span>
          </p>
        </div>
        <Badge variant={statusConfig[document.status].variant}>{document.status.toLowerCase()}</Badge>
      </div>
      <div className="text-muted-foreground flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span>Created by:</span>
          <span className="text-foreground font-medium">{document.created_by.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Category:</span>
          <span className="text-foreground font-medium">{document.category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Updated:</span>
          <time className="text-foreground font-medium">{format(new Date(document.updated_at), 'MMMM d, yyyy')}</time>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button className="flex cursor-pointer items-center rounded-sm leading-relaxed uppercase" size="lg">
            <PenLine /> Sign Document
          </Button>
          <Button className="flex cursor-pointer items-center rounded-sm leading-relaxed uppercase" size="lg" variant="ghost">
            <Download /> Download
          </Button>
        </div>
      </div>
    </div>
  );
}
