import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type Document } from '@/types/document';
import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';

type RecentDocumentsProps = {
  documents: Document[];
};

const statusConfig = {
  draft: {
    icon: Clock,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
    gradient: 'from-gray-400 to-gray-600',
    label: 'Draft',
  },
  in_review: {
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    gradient: 'from-amber-400 to-amber-600',
    label: 'In Review',
  },
  approved: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    gradient: 'from-green-400 to-green-600',
    label: 'Approved',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    gradient: 'from-red-400 to-red-600',
    label: 'Rejected',
  },
  published: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    gradient: 'from-emerald-400 to-emerald-600',
    label: 'Published',
  },
};

export default function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <Card className="h-fit rounded-xs">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Documents
          <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5">
            <FileText className="h-4 w-4 text-white" />
          </div>
        </CardTitle>
        <CardDescription className="mt-2">Your latest document activities</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document, index) => {
              const status = document.status as keyof typeof statusConfig;
              const config = statusConfig[status] || statusConfig.draft;
              const StatusIcon = config.icon;

              return (
                <div key={document.id}>
                  <Link href={route('documents.show', document.id)}>
                    <div className="group hover:border-primary relative flex cursor-pointer items-start gap-3 rounded-sm border-2 border-transparent p-3 transition-all duration-300 hover:shadow-md">
                      <div
                        className={cn(
                          'mt-0.5 rounded-full bg-gradient-to-br p-2 transition-transform duration-300 group-hover:scale-110',
                          config.gradient
                        )}
                      >
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="group-hover:text-primary text-sm leading-tight font-semibold transition-colors duration-300">
                              {document.title}
                            </p>
                            <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                          </div>
                          <Badge variant="outline" className={cn('shrink-0 border-0', config.bg, config.color)}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground font-mono text-xs">{document.code}</p>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>{document.category.name}</span>
                          <span>•</span>
                          <span>{document.created_at}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {index < documents.length - 1 && <Separator className="my-2" />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-4 dark:from-gray-800 dark:to-gray-700">
              <FileText className="text-muted-foreground h-8 w-8" />
            </div>
            <p className="mt-4 text-sm font-medium">No recent documents</p>
            <p className="text-muted-foreground text-xs">Your documents will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
