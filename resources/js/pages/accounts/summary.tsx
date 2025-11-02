import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserProfileLayout, { UserProfile } from '@/layouts/accounts/account-profile-layout';
import { getOnlineStatusBadge } from '@/lib/online-status';
import { getVerificationStatusBadge } from '@/lib/verification-status';
import { usePage } from '@inertiajs/react';

type PageProps = {
  user: UserProfile;
};

export default function Summary() {
  const { user } = usePage<PageProps>().props;

  return (
    <UserProfileLayout user={user} activeTab="summary">
      <div className="flex flex-col space-y-6">
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
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</Label>
                </div>
                <Input className="border-0 text-sm shadow-none ring-0" value={user.email} disabled />
              </div>
              <div className="flex items-center px-6 py-4">
                <div className="w-32 flex-shrink-0">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Department:</Label>
                </div>
                <Input className="border-0 text-sm shadow-none ring-0" value={user.department?.name || 'Not Assigned'} disabled />
              </div>
              <div className="flex items-center px-6 py-4">
                <div className="w-32 flex-shrink-0">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Position:</Label>
                </div>
                <Input className="border-0 text-sm shadow-none ring-0" value={user.position || 'Not Assigned'} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xs border-none shadow-none">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="flex items-center px-6 py-4">
                <div className="w-32 flex-shrink-0">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Created:</Label>
                </div>
                <Input className="border-0 text-sm shadow-none ring-0" value={user.created_at} disabled />
              </div>
              <div className="flex items-center px-6 py-4">
                <div className="w-32 flex-shrink-0">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</Label>
                </div>
                {getOnlineStatusBadge(user.online_status)}
              </div>
              <div className="flex items-center px-6 py-4">
                <div className="w-32 flex-shrink-0">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Verified:</Label>
                </div>
                <div className="text-sm">{getVerificationStatusBadge(user.is_email_verified)}</div>
              </div>
              <div className="flex items-center px-6 py-4">
                <div className="w-32 flex-shrink-0">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Roles:</Label>
                </div>
                {user.roles.map(role => (
                  <p key={role} className="text-muted-foreground text-sm" aria-disabled>
                    {role
                      ?.split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserProfileLayout>
  );
}
