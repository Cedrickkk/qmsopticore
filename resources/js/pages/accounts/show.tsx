import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { getOnlineStatusBadge } from '@/lib/online-status';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Activity, BadgeCheckIcon, FilesIcon, Pencil, Settings, User } from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  position?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  department: {
    id: number;
    name: string;
  };
  roles: Array<{
    id: number;
    name: string;
  }>;
  permissions: Array<{
    id: number;
    name: string;
    display_name?: string;
  }>;
  stats: {
    total_documents: number;
    pending_approvals: number;
    recent_activity_count: number;
  };
  online_status: string;
}

type PageProps = {
  user: UserProfile;
};

export default function Show() {
  const { user } = usePage<PageProps>().props;
  const getInitials = useInitials();

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
          {/* Main Card with User Profile Header and Tabs */}
          <div className="mb-4 flex justify-end">
            <Button className="rounded-xs" variant="ghost">
              <Pencil />
              Edit Profile
            </Button>
          </div>
          <Card className="rounded-xs">
            {/* Card Header - User Profile */}
            <CardHeader className="space-y-6 px-12 py-6">
              <div className="flex flex-col space-y-5 space-x-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
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
                  {/* Additional info row similar to the image */}
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
                      <p className="text-gray-500">Status</p>
                      <div className="flex items-center">
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Card Content - Tabs */}
            <CardContent className="p-0">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="h-auto w-full justify-start rounded-none border-b border-gray-200 bg-transparent p-0 dark:border-gray-700">
                  <TabsTrigger
                    value="summary"
                    className="data-[state=active]:border-primary flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:text-blue-400"
                  >
                    <User className="h-4 w-4" />
                    <span>Summary</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="data-[state=active]:border-primary flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:text-blue-400"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Activity</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="data-[state=active]:border-primary flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:text-blue-400"
                  >
                    <FilesIcon className="h-4 w-4" />
                    <span>Documents</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:border-primary flex items-center space-x-2 rounded-none border-b-2 border-transparent bg-transparent px-6 py-4 text-sm font-medium hover:bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:text-blue-400"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-0 p-6">
                  <div className="flex flex-col">
                    {/* Personal Details Section */}
                    <Card className="rounded-xs border-none shadow-none">
                      <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full name:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={user.name} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={'January 1, 1987'} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gender:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={'Male'} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nationality:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={'Filipino'} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={'Office Location Philippines'} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={'(+63) 912-345-6789'} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={user.email} disabled />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Account Details Section */}
                    <Card className="rounded-xs border-none shadow-none">
                      <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Roles:</Label>
                            </div>
                            <Input
                              className="border-0 text-sm shadow-none ring-0"
                              multiple
                              value={user.roles.map(role => {
                                return role.name
                                  ?.split('_')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ');
                              })}
                              disabled
                            />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Display Name:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={user.name} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Created:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={user.created_at} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Login:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={'August 22, 2024'} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Status:</Label>
                            </div>
                            {getOnlineStatusBadge(user.online_status)}
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Verified:</Label>
                            </div>
                            <div className="text-sm">
                              <Badge variant={`${user.email_verified_at ? 'default' : 'destructive'}`}>
                                {user.email_verified_at && <BadgeCheckIcon />}
                                {user.email_verified_at ? 'Verified' : 'Unverified'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Department:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={'Not Assigned'} disabled />
                          </div>
                          <div className="flex items-center px-6 py-4">
                            <div className="w-32 flex-shrink-0">
                              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Position:</Label>
                            </div>
                            <Input className="border-0 text-sm shadow-none ring-0" value={user.position} disabled />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-0 p-6">
                  <div className="space-y-6">
                    <Card className="rounded-xs">
                      <CardContent className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Account Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</Label>
                              <p className="text-xs text-gray-500">Receive notifications about account activity</p>
                            </div>
                            <Button size="sm" variant="outline" className="rounded-xs">
                              Configure
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Privacy Settings</Label>
                              <p className="text-xs text-gray-500">Control who can see your information</p>
                            </div>
                            <Button size="sm" variant="outline" className="rounded-xs">
                              Manage
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Data Export</Label>
                              <p className="text-xs text-gray-500">Download your account data</p>
                            </div>
                            <Button size="sm" variant="outline" className="rounded-xs">
                              Export
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xs border-red-200 dark:border-red-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-red-600">Delete Account</Label>
                            <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                          </div>
                          <Button size="sm" variant="destructive" className="rounded-xs">
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
