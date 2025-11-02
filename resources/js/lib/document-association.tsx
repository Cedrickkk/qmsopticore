import { Badge } from '@/components/ui/badge';

type AssociationConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

const associationConfig: AssociationConfig = {
  creator: {
    label: 'Creator',
    color: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300',
  },
  signatory: {
    label: 'Signatory',
    color: 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300',
  },
  recipient: {
    label: 'Recipient',
    color: 'border-transparent bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300',
  },
  unknown: {
    label: 'Unknown',
    color: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300',
  },
};

export const getDocumentAssociationBadge = (association: string, className?: string) => {
  const normalizedAssociation = association.toLowerCase().includes('signatory') ? 'signatory' : association.toLowerCase();

  const config = associationConfig[normalizedAssociation] || associationConfig.unknown;

  return <Badge className={`${config?.color} font-medium ${className || ''}`}>{association}</Badge>;
};
