import { Badge } from '@/components/ui/badge';
import { Eye, Lock, Shield } from 'lucide-react';

const confidentialityConfig = {
  public: {
    priority: 4,
    label: 'Public',
    shortLabel: 'PUBLIC',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700 dark:text-gray-400',
    iconColor: 'text-gray-700 dark:text-gray-400',
    bannerColor: 'border-gray-300 bg-gray-50 text-gray-700',
    icon: Eye,
    description: 'Anyone can view this document',
  },
  internal: {
    priority: 3,
    label: 'Internal Use Only',
    shortLabel: 'INTERNAL USE ONLY',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    iconColor: 'text-yellow-700 dark:text-yellow-400',
    bannerColor: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    icon: Shield,
    description: 'Only authenticated users can view. Auto-locks after 2 minutes of inactivity.',
  },
  confidential: {
    priority: 2,
    label: 'Confidential',
    shortLabel: 'CONFIDENTIAL',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700 dark:text-orange-400',
    iconColor: 'text-orange-700 dark:text-orange-400',
    bannerColor: 'border-orange-500 bg-orange-50 text-orange-700',
    icon: Lock,
    description: 'Restricted access with enhanced security. Auto-locks after 1 minute. Requires password re-authentication.',
  },
} as const;

export type ConfidentialityType = keyof typeof confidentialityConfig;

export const getConfidentialityConfig = (level: string) => {
  const normalizedLevel = level.toLowerCase().replace(/\s+/g, '_') as ConfidentialityType;
  return (
    confidentialityConfig[normalizedLevel] || {
      priority: 999,
      label: level.charAt(0).toUpperCase() + level.slice(1),
      shortLabel: level.toUpperCase(),
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-700 dark:text-gray-400',
      iconColor: 'text-gray-700 dark:text-gray-400',
      bannerColor: 'border-gray-300 bg-gray-50 text-gray-700',
      icon: Eye,
      description: '',
    }
  );
};

export const getConfidentialityBadge = (level: string, className?: string, showIcon: boolean = true) => {
  const config = getConfidentialityConfig(level);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} ${config.borderColor} inline-flex items-center gap-1 border font-medium ${className || ''}`}>
      {showIcon && <Icon className={`h-3 w-3 ${config.iconColor}`} />}
      {config.label}
    </Badge>
  );
};

export const getConfidentialityTextColor = (level: string) => {
  const config = getConfidentialityConfig(level);
  return config.textColor;
};

export const getConfidentialityIconColor = (level: string) => {
  const config = getConfidentialityConfig(level);
  return config.iconColor;
};

export const getConfidentialityLabel = (level: string, short: boolean = false) => {
  const config = getConfidentialityConfig(level);
  return short ? config.shortLabel : config.label;
};

export const getConfidentialityColor = (level: string) => {
  const config = getConfidentialityConfig(level);
  return config.color;
};

export const getConfidentialityBannerColor = (level: string) => {
  const config = getConfidentialityConfig(level);
  return config.bannerColor;
};

export const getConfidentialityDescription = (level: string) => {
  const config = getConfidentialityConfig(level);
  return config.description;
};

export const getConfidentialityIcon = (level: string) => {
  const config = getConfidentialityConfig(level);
  return config.icon;
};

export const getAutoBlurSeconds = (level: string): number => {
  const normalizedLevel = level.toLowerCase().replace(/\s+/g, '_') as ConfidentialityType;

  switch (normalizedLevel) {
    case 'confidential':
      return 60;
    case 'internal':
      return 120;
    default:
      return 0;
  }
};

export const requiresReauth = (level: string): boolean => {
  const normalizedLevel = level.toLowerCase().replace(/\s+/g, '_') as ConfidentialityType;
  return normalizedLevel === 'confidential';
};
