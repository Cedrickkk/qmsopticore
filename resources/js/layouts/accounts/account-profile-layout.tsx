import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { getOnlineStatusBadge } from '@/lib/online-status';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, FilesIcon, Key, User } from 'lucide-react';
import { ReactNode } from 'react';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  position?: string;
  email_verified_at: string | null;
  online_status: string;
  is_currently_logged_in: boolean;
  created_at: string;
  updated_at: string;
  department: {
    id: number;
    name: string;
  };
  is_email_verified: boolean;
  roles: string[];
  permissions: Array<{
    id: number;
    name: string;
    display_name?: string;
  }>;
}

interface UserProfileLayoutProps {
  user: UserProfile;
  activeTab: 'summary' | 'activity' | 'documents' | 'settings' | 'permissions';
  children: ReactNode;
}

export default function UserProfileLayout({ user, activeTab, children }: UserProfileLayoutProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Accounts',
      href: '/accounts',
    },
    {
      title: user.name,
      href: `/accounts/${user.id}`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${user.name} - Profile`} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl py-6">
          {/* <div className="mb-4 flex justify-end">
            <Button className="rounded-xs" variant="ghost">
              <Pencil />
              Edit Profile
            </Button>
          </div> */}

          <Card className="rounded-xs">
            <CardHeader className="space-y-6 px-12 py-6">
              <div className="flex flex-col space-y-5 space-x-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                    <div className="text-muted-foreground mt-1 flex items-center text-sm">
                      <span>{user.position || 'No Position Assigned'}</span>
                      <span className="mx-2">•</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex-1">
                  <div className="mt-3 flex justify-items-start gap-16 text-sm">
                    <div>
                      <p className="text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{user.department?.name || 'Not Assigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Registered Since</p>
                      <p className="font-medium text-gray-900">{user.created_at}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Online Status</p>
                      <div className="flex items-center">{getOnlineStatusBadge(user.online_status)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <Tabs className="w-full">
              <TabsList className="h-auto w-full justify-start rounded-none border-b border-gray-200 bg-transparent p-0 dark:border-gray-700">
                <TabsTrigger
                  value="summary"
                  asChild
                  className={`"data-[state=active]:border-primary dark:data-[state=active]:text-blue-400" flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === 'summary'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }}`}
                >
                  <Link href={`/accounts/${user.id}/summary`} preserveScroll preserveState>
                    <User className="h-4 w-4" />
                    <span>Summary</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  asChild
                  className={`"data-[state=active]:border-primary dark:data-[state=active]:text-blue-400" flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }}`}
                >
                  <Link href={`/accounts/${user.id}/activity`} preserveScroll preserveState>
                    <Activity className="h-4 w-4" />
                    <span>Activity</span>
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  asChild
                  className={`"data-[state=active]:border-primary dark:data-[state=active]:text-blue-400" flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === 'documents'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }}`}
                >
                  <Link href={`/accounts/${user.id}/documents`} preserveScroll preserveState>
                    <FilesIcon className="h-4 w-4" />
                    <span>Documents</span>
                  </Link>
                </TabsTrigger>

                <TabsTrigger
                  value="permissions"
                  asChild
                  className={`"data-[state=active]:border-primary dark:data-[state=active]:text-blue-400" flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === 'permissions'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }}`}
                >
                  <Link href={`/accounts/${user.id}/permissions`} preserveScroll preserveState>
                    <Key className="h-4 w-4" />
                    <span>Permissions</span>
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <CardContent className="p-6">{children}</CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
