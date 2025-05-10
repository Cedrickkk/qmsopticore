import { useAppearance } from '@/hooks/use-appearance';
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import { Toaster } from 'sonner';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
  const { appearance } = useAppearance();
  return (
    <AuthLayoutTemplate title={title} description={description} {...props}>
      {children}
      <Toaster theme={appearance} duration={10000} />
    </AuthLayoutTemplate>
  );
}
