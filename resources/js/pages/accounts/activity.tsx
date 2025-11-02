import { TablePagination } from '@/components/table-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileLayout, { UserProfile } from '@/layouts/accounts/account-profile-layout';
import { getActionBadge, getActivityIcon } from '@/lib/activity-actions';
import { PaginatedData } from '@/types';
import { ActivityLog } from '@/types/activity-log';
import { usePage } from '@inertiajs/react';
import { Clock } from 'lucide-react';

type PageProps = {
  user: UserProfile;
  activities: PaginatedData<ActivityLog>;
};

export default function Activity() {
  const { user, activities } = usePage<PageProps>().props;

  return (
    <UserProfileLayout user={user} activeTab="activity">
      <div className="space-y-6">
        <Card className="rounded-xs border-none shadow-none">
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>Complete log of user actions and system interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.data.length > 0 ? (
              <div className="space-y-4">
                {activities.data.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="mt-1 flex-shrink-0">{getActivityIcon(activity.action)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                            <span>{activity.entity_type}</span>
                            <span>•</span>
                            <span>{activity.created_at}</span>
                          </div>
                          {activity.ip_address && <div className="mt-1 text-xs text-gray-400">IP: {activity.ip_address}</div>}
                        </div>
                        <div className="ml-4 flex-shrink-0">{getActionBadge(activity.action)}</div>
                      </div>

                      {(activity.old_values || activity.new_values) && (
                        <div className="mt-2 text-xs text-gray-600">
                          <details className="cursor-pointer">
                            <summary className="hover:text-gray-800">View changes</summary>
                            <div className="mt-2 space-y-2">
                              {activity.old_values && (
                                <div>
                                  <span className="font-medium text-red-600">Before:</span>
                                  <pre className="mt-1 overflow-auto rounded border border-red-200 bg-red-50 p-2 text-xs">
                                    {JSON.stringify(activity.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {activity.new_values && (
                                <div>
                                  <span className="font-medium text-green-600">After:</span>
                                  <pre className="mt-1 overflow-auto rounded border border-green-200 bg-green-50 p-2 text-xs">
                                    {JSON.stringify(activity.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="mt-6">
                  <TablePagination data={activities} />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
                <p className="text-muted-foreground mt-1 text-sm">This user hasn't performed any activities yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserProfileLayout>
  );
}
