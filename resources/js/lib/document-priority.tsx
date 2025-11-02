import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowUp, Minus } from 'lucide-react';

const priorityConfig = {
  normal: {
    priority: 3,
    label: 'Normal',
    shortLabel: 'NORMAL',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700 dark:text-blue-400',
    iconColor: 'text-blue-700 dark:text-blue-400',
    icon: Minus,
    description: 'Standard priority - normal processing time',
  },
  high: {
    priority: 2,
    label: 'High',
    shortLabel: 'HIGH',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700 dark:text-orange-400',
    iconColor: 'text-orange-700 dark:text-orange-400',
    icon: ArrowUp,
    description: 'Important - should be addressed soon',
  },
  urgent: {
    priority: 1,
    label: 'Urgent',
    shortLabel: 'URGENT',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    borderColor: 'border-red-200',
    textColor: 'text-red-700 dark:text-red-400',
    iconColor: 'text-red-700 dark:text-red-400',
    icon: AlertTriangle,
    description: 'Requires immediate attention and action',
  },
} as const;

export type PriorityType = keyof typeof priorityConfig;

export const getPriorityConfig = (priority: string) => {
  const normalizedPriority = priority.toLowerCase().replace(/\s+/g, '_') as PriorityType;
  return (
    priorityConfig[normalizedPriority] || {
      priority: 999,
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      shortLabel: priority.toUpperCase(),
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700 dark:text-gray-400',
      iconColor: 'text-gray-700 dark:text-gray-400',
      icon: Minus,
      description: '',
    }
  );
};

export const getPriorityBadge = (priority: string, className?: string, showIcon: boolean = true) => {
  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} ${config.borderColor} inline-flex items-center gap-1 border font-medium ${className || ''}`}>
      {showIcon && <Icon className={`h-3 w-3 ${config.iconColor}`} />}
      {config.label}
    </Badge>
  );
};

export const getPriorityLabel = (priority: string, short: boolean = false) => {
  const config = getPriorityConfig(priority);
  return short ? config.shortLabel : config.label;
};

export const getPriorityColor = (priority: string) => {
  const config = getPriorityConfig(priority);
  return config.color;
};

export const getPriorityTextColor = (priority: string) => {
  const config = getPriorityConfig(priority);
  return config.textColor;
};

export const getPriorityIconColor = (priority: string) => {
  const config = getPriorityConfig(priority);
  return config.iconColor;
};

export const getPriorityDescription = (priority: string) => {
  const config = getPriorityConfig(priority);
  return config.description;
};

export const getPriorityIcon = (priority: string) => {
  const config = getPriorityConfig(priority);
  return config.icon;
};
