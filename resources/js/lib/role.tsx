import { Badge } from '@/components/ui/badge';

type RoleConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

const roleConfig: RoleConfig = {
  signatory: {
    label: 'Signatory',
    color: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300',
  },
  recipient: {
    label: 'Recipient',
    color: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300',
  },
};

export const getUserRoleBadge = (role: string, className?: string) => {
  const config = roleConfig[role];

  if (!config) {
    return null;
  }

  return <Badge className={`${config.color} font-medium ${className || ''}`}>{config.label}</Badge>;
};
