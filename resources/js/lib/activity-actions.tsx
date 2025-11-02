import { Badge } from '@/components/ui/badge';
import { Clock, Eye, FileText, Settings, Shield, User } from 'lucide-react';

export const actionConfig = {
  login: {
    variant: 'default' as const,
    label: 'Login',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: Shield,
  },
  logout: {
    variant: 'outline' as const,
    label: 'Logout',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Shield,
  },
  created: {
    variant: 'default' as const,
    label: 'Created',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: User,
  },
  updated: {
    variant: 'secondary' as const,
    label: 'Updated',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: Settings,
  },
  deleted: {
    variant: 'destructive' as const,
    label: 'Deleted',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: FileText,
  },
  viewed: {
    variant: 'outline' as const,
    label: 'Viewed',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    icon: Eye,
  },
  downloaded: {
    variant: 'outline' as const,
    label: 'Downloaded',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    icon: Eye,
  },
  approved: {
    variant: 'default' as const,
    label: 'Approved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: Settings,
  },
  rejected: {
    variant: 'destructive' as const,
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: Settings,
  },
  published: {
    variant: 'default' as const,
    label: 'Published',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: Settings,
  },
  archived: {
    variant: 'outline' as const,
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Settings,
  },
} as const;

export type ActionType = keyof typeof actionConfig;

export const getActivityActionConfig = (action: string) => {
  return (
    actionConfig[action as ActionType] || {
      variant: 'outline' as const,
      label: action.charAt(0).toUpperCase() + action.slice(1),
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      icon: Clock,
    }
  );
};

export const getActivityIcon = (action: string) => {
  const config = getActivityActionConfig(action);
  const IconComponent = config.icon;

  const colorMap = {
    created: 'text-green-500',
    updated: 'text-blue-500',
    deleted: 'text-red-500',
    login: 'text-purple-500',
    logout: 'text-purple-500',
    viewed: 'text-gray-500',
    downloaded: 'text-gray-500',
    approved: 'text-green-500',
    rejected: 'text-red-500',
    published: 'text-blue-500',
    archived: 'text-gray-500',
  };

  const colorClass = colorMap[action as keyof typeof colorMap] || 'text-gray-500';

  return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
};

export const getActionBadge = (action: string) => {
  const config = getActivityActionConfig(action);

  return (
    <Badge variant={config.variant} className={`${config.color} font-medium`}>
      {config.label}
    </Badge>
  );
};
