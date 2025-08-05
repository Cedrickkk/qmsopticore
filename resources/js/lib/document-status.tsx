import { Badge } from '@/components/ui/badge';

const statusConfig = {
  draft: {
    variant: 'outline' as const,
    priority: 5,
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  in_review: {
    variant: 'secondary' as const,
    priority: 4,
    label: 'In Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  approved: {
    variant: 'default' as const,
    priority: 3,
    label: 'Approved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  published: {
    variant: 'default' as const,
    priority: 1,
    label: 'Published',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  rejected: {
    variant: 'destructive' as const,
    priority: 6,
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  archived: {
    variant: 'outline' as const,
    priority: 2,
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
} as const;

export type StatusType = keyof typeof statusConfig;

export const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as StatusType;
  return (
    statusConfig[normalizedStatus] || {
      variant: 'outline' as const,
      priority: 999,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    }
  );
};

export const getDocumentStatusBadge = (status: string, className?: string) => {
  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={`${config.color} font-medium ${className || ''}`}>
      {config.label}
    </Badge>
  );
};
