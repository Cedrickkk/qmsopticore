import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps, ReactNode } from 'react';

type PaginationLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  link: {
    url: string;
    label: string;
    active: boolean;
  };
  children?: ReactNode;
};

export default function PaginationLink({ link, className = '', children, ...props }: PaginationLinkProps) {
  return (
    <Link
      href={link.url}
      preserveState
      preserveScroll
      className={cn(
        'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-sm text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        link.active ? 'border-input bg-background h-6 w-auto border p-2 md:h-8 md:p-3' : 'h-8 w-auto p-1 sm:h-8 sm:p-2 md:h-8 md:p-2',
        !link.url ? 'pointer-events-none opacity-50' : 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children || <span dangerouslySetInnerHTML={{ __html: link.label }} />}
    </Link>
  );
}
