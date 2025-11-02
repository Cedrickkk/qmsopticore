import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { FileArchive, FolderRoot, LayoutGrid, LayoutPanelTop, Menu, Users } from 'lucide-react';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutGrid,
    requiredRoles: ['super_admin', 'department_admin'],
  },
  {
    title: 'Documents',
    url: '/documents',
    icon: FolderRoot,
    requiredRoles: ['super_admin', 'department_admin', 'regular_user'],
  },
  {
    title: 'Departments',
    url: '/departments',
    icon: LayoutPanelTop,
    requiredRoles: ['super_admin'],
  },
  {
    title: 'Accounts',
    url: '/accounts',
    icon: Users,
    requiredRoles: ['super_admin', 'department_admin'],
  },
  {
    title: 'Archives',
    url: '/archives',
    icon: FileArchive,
    requiredRoles: ['super_admin', 'department_admin'],
  },
  {
    title: 'System Settings',
    url: '/system-settings',
    icon: FileArchive,
    requiredRoles: ['super_admin'],
  },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const page = usePage<SharedData>();
  const { auth } = page.props;
  const userRoles = auth.user.roles || [];
  const getInitials = useInitials();

  const isActiveRoute = (url: string) => {
    return page.url.startsWith(url);
  };

  const filteredNavItems = mainNavItems.filter(({ requiredRoles }) => {
    if (!requiredRoles) return false;

    return requiredRoles.some(requiredRole => (userRoles.includes(requiredRole) ? true : false));
  });

  return (
    <>
      <div className="border-sidebar-border/80 border-b">
        <div className="mx-auto flex h-16 items-center gap-2 px-4 md:max-w-7xl">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-[34px] w-[34px] md:mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between p-4">
                <SheetTitle className="sr-only">Quality Management System Menu</SheetTitle>
                <SheetHeader className="flex justify-start gap-3 px-0 py-3 text-left">
                  {/* <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" /> */}
                  <img src="/images/plp-1.png" alt="Pamantasan ng Lungsod ng Pasig Logo" className="size-9 scale-125 rounded-full dark:bg-white" />
                  <span className="text-sm">
                    <span className="text-muted-foreground max-w-full text-xs text-nowrap">Pamantasan ng Lungsod ng Pasig</span> <br />
                    <span className="mt-1 block font-semibold text-nowrap">Quality Management System</span>
                  </span>
                </SheetHeader>
                <div className="mt-6 flex h-full flex-1 flex-col space-y-4">
                  <div className="flex h-full flex-col justify-between text-sm">
                    <div className="flex flex-col space-y-4">
                      {filteredNavItems.map(item => (
                        <Link key={item.title} href={item.url} className="flex items-center space-x-2 font-medium">
                          {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href={userRoles.includes('super_admin') ? '/dashboard' : '/documents'} className="flex items-center space-x-2">
            <AppLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
              <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {filteredNavItems.map((item, index) => (
                  <NavigationMenuItem key={index} className="relative flex h-full items-center">
                    <Link
                      href={item.url}
                      className={cn(navigationMenuTriggerStyle(), page.url === item.url && activeItemStyles, 'h-9 cursor-pointer px-3')}
                    >
                      {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                      {item.title}
                    </Link>
                    {isActiveRoute(item.url) && <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white" />}
                    {/* {page.url === item.url && <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px dark:bg-white"></div>} */}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 rounded-full p-1">
                  <Avatar className="size-8 overflow-hidden rounded-full">
                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                      {getInitials(auth.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <UserMenuContent user={auth.user} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {breadcrumbs.length > 1 && (
        <div className="border-sidebar-border/70 flex w-full border-b">
          <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        </div>
      )}
    </>
  );
}
