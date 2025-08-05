import { getActionTitle } from '@/hooks/use-action-title';
import { getDocumentStatusBadge } from '@/lib/document-status';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { History } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

type DocumentWorkflowHistoryProps = {
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
};

export default function DocumentWorkflowHistory({ workflowLogs }: DocumentWorkflowHistoryProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex w-full items-center justify-start gap-2 rounded-xs">
          <History className="h-4 w-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-4xl min-w-[55vw] p-6">
        <SheetHeader className="sr-only p-6 pb-0">
          <SheetTitle>Document Preview</SheetTitle>
          <SheetDescription>Scroll to view the entire document and controls.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-screen p-6">
          <div className="space-y-6">
            {workflowLogs.map(log => (
              <div key={log.id} className="space-y-3">
                {/* Main Action */}
                <div>
                  <h3 className="text-base leading-tight font-medium text-gray-900">{getActionTitle(log.action)}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    By {log.user.name}
                    <span className="mx-1">•</span>
                    <time>{log.createdAt}</time>
                  </div>
                </div>
                {(log.fromStatus || log.toStatus) && log.fromStatus !== log.toStatus && (
                  <div className="flex items-center space-x-3 text-sm">
                    {log.fromStatus && getDocumentStatusBadge(log.fromStatus, 'uppercase')}
                    <span className="text-gray-400">→</span>
                    {log.toStatus && getDocumentStatusBadge(log.toStatus, 'uppercase')}
                  </div>
                )}
                {/* Notes */}
                {log.notes && <div className="border-l-3 border-gray-300 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">{log.notes}</div>}
                <Separator />
              </div>
            ))}

            {/* Empty state */}
            {workflowLogs.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <p className="text-sm">No history available for this document.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
