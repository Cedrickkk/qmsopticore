import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const signatoryStatusConfig = {
  pending: {
    variant: 'outline' as const,
    label: 'Pending',
    color: 'border-yellow-500 text-yellow-600',
    bgColor: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  approved: {
    variant: 'outline' as const,
    label: 'Approved',
    color: 'border-green-500 text-green-600',
    bgColor: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  rejected: {
    variant: 'outline' as const,
    label: 'Rejected',
    color: 'border-red-500 text-red-600',
    bgColor: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
} as const;

export type SignatoryStatusType = keyof typeof signatoryStatusConfig;

export const getSignatoryStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase() as SignatoryStatusType;
  return (
    signatoryStatusConfig[normalizedStatus] || {
      variant: 'outline' as const,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: 'border-gray-500 text-gray-600',
      bgColor: 'bg-gray-100 text-gray-700',
      icon: Clock,
    }
  );
};

export const getSignatoryStatusBadge = (status: string, withIcon: boolean = true, className?: string) => {
  const config = getSignatoryStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.color} font-medium ${className || ''}`}>
      {withIcon && <IconComponent className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

export const getSignatoryStatusIndicator = (status: string, index: number) => {
  const config = getSignatoryStatusConfig(status);

  return <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${config.bgColor}`}>{index + 1}</div>;
};

export const getSignatoryStatusText = (status: string) => {
  const config = getSignatoryStatusConfig(status);

  const colorMap = {
    approved: 'text-green-500',
    rejected: 'text-red-500',
    pending: 'text-amber-500',
  };

  const colorClass = colorMap[status as keyof typeof colorMap] || 'text-gray-500';

  return <span className={`text-xs font-medium ${colorClass}`}>{config.label}</span>;
};
