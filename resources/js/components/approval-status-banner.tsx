import { CheckCircle, Hourglass, XCircle } from 'lucide-react';

interface ApprovalStatusBannerProps {
  status: string;
  nextSignatory: {
    id: number;
    order: number;
    name: string;
  } | null;
}

export function ApprovalStatusBanner({ status, nextSignatory }: ApprovalStatusBannerProps) {
  if (status === 'published') {
    return (
      <div className="mb-4 w-full rounded-sm border border-green-200 bg-green-50 p-2 dark:border-green-900 dark:bg-green-950/50">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
            <CheckCircle className="size-3" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-medium text-green-800 dark:text-green-300">Document Published</p>
            <p className="text-xs text-green-700 dark:text-green-400">This document is final and has been published.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="mb-4 w-full rounded-sm border border-red-200 bg-red-50 p-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700">
            <XCircle className="size-3" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-medium text-red-800">Document Rejected</p>
            <p className="text-xs text-red-700">This document has been rejected.</p>
          </div>
        </div>
      </div>
    );
  }

  if (nextSignatory) {
    return (
      <div className="mb-4 w-full rounded-sm border border-amber-200 bg-amber-50 p-2 dark:border-amber-900 dark:bg-amber-950/50">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
            <Hourglass className="size-3" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Waiting for approval</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {nextSignatory.name} needs to sign as signatory #{nextSignatory.order}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
