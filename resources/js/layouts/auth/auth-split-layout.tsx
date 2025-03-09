import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
  const { name, quote, version } = usePage<SharedData>().props;

  return (
    <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div className="bg-primary/20 absolute inset-0 bg-[url('/images/home-img.jpg')] bg-cover bg-right bg-no-repeat" />\
        <div className="bg-primary/50 absolute inset-0" />
        <Link href={route('login')} className="relative z-20 flex items-center gap-4 text-lg font-medium">
          <img src="/images/plp.png" alt="Pamantasan ng Lungsod ng Pasig Logo" className="size-12 scale-150" />
          {name}
        </Link>
        {quote && (
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
              <footer className="text-neutral text-sm">Hiraya Manawari</footer>
            </blockquote>
          </div>
        )}
        <span className="text-neutral z-40 mt-4 self-end text-xs">QMS Version: {version}</span>
      </div>
      <div className="w-full lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Link href={route('login')} className="relative z-20 flex items-center justify-center lg:hidden">
            <img src="/images/plp.png" alt="Pamantasan ng Lungsod ng Pasig Logo" className="size-12 scale-150" />
          </Link>
          <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
            <h1 className="text-xl font-medium">{title}</h1>
            <p className="text-muted-foreground text-sm text-balance">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
