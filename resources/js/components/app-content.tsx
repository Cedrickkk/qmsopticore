import { SidebarInset } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster } from 'sonner';

interface AppContentProps extends React.ComponentProps<'div'> {
  variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
  const { appearance } = useAppearance();

  if (variant === 'sidebar') {
    return <SidebarInset {...props}>{children}</SidebarInset>;
  }

  return (
    <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl p-4" {...props}>
      {children}
      <Toaster theme={appearance} duration={10000} />
    </main>
  );
}
