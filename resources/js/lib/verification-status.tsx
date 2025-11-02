import { Badge } from '@/components/ui/badge';
import { BadgeCheckIcon } from 'lucide-react';

type VerificationConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon?: React.ReactNode;
  };
};

const verificationConfig: VerificationConfig = {
  verified: {
    label: 'Verified',
    color: 'border-transparent bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300',
    icon: <BadgeCheckIcon className="mr-1 h-3 w-3" />,
  },
  unverified: {
    label: 'Unverified',
    color: 'border-transparent bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300',
  },
};

export const getVerificationStatusBadge = (isVerified: boolean, className?: string) => {
  const status = isVerified ? 'verified' : 'unverified';
  const config = verificationConfig[status];

  if (!config) {
    return null;
  }

  return (
    <Badge className={`${config.color} font-medium ${className || ''}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
