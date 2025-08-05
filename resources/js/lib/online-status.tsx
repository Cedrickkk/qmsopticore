import { Badge } from '@/components/ui/badge';
import { Circle, Wifi, WifiOff } from 'lucide-react';

export const onlineStatusConfig = {
  active: {
    variant: 'default' as const,
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: Wifi,
  },
  inactive: {
    variant: 'outline' as const,
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: WifiOff,
  },
  online: {
    variant: 'default' as const,
    label: 'Online',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: Circle,
  },
  offline: {
    variant: 'outline' as const,
    label: 'Offline',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Circle,
  },
} as const;

export type OnlineStatusType = keyof typeof onlineStatusConfig;

export const getOnlineStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase() as OnlineStatusType;
  return (
    onlineStatusConfig[normalizedStatus] || {
      variant: 'outline' as const,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      icon: WifiOff,
    }
  );
};

export const getOnlineStatusBadge = (status: string, withIcon: boolean = false, className?: string) => {
  const config = getOnlineStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.color} font-medium ${className || ''}`}>
      {withIcon && <IconComponent className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

export const getOnlineStatusIndicator = (status: string) => {
  const config = getOnlineStatusConfig(status);
  const IconComponent = config.icon;

  const colorMap = {
    active: 'text-green-500',
    online: 'text-green-500',
    inactive: 'text-gray-500',
    offline: 'text-gray-500',
  };

  const colorClass = colorMap[status.toLowerCase() as keyof typeof colorMap] || 'text-gray-500';

  return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
};

export const getOnlineStatusText = (status: string) => {
  const config = getOnlineStatusConfig(status);

  const colorMap = {
    active: 'text-green-500',
    online: 'text-green-500',
    inactive: 'text-gray-500',
    offline: 'text-gray-500',
  };

  const colorClass = colorMap[status.toLowerCase() as keyof typeof colorMap] || 'text-gray-500';

  return <span className={`text-xs font-medium ${colorClass}`}>{config.label}</span>;
};
