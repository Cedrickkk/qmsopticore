import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import UserProfileLayout, { UserProfile } from '@/layouts/accounts/account-profile-layout';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

type Permission = {
  id: number;
  name: string;
  action: string;
  title: string;
  description: string;
};

type PermissionGroup = {
  type: string;
  title: string;
  permissions: Permission[];
};

type PageProps = {
  user: UserProfile;
  permissions: PermissionGroup[];
};

export default function Permissions() {
  const { user, permissions } = usePage<PageProps>().props;

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    permissions.forEach(group => {
      group.permissions.forEach(permission => {
        initial[permission.id.toString()] = true;
      });
    });
    return initial;
  });

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: checked,
    }));
  };

  const handleSelectAll = (groupType: string, checked: boolean) => {
    const group = permissions.find(g => g.type === groupType);
    if (group) {
      const updates: Record<string, boolean> = {};
      group.permissions.forEach(permission => {
        updates[permission.id.toString()] = checked;
      });
      setSelectedPermissions(prev => ({
        ...prev,
        ...updates,
      }));
    }
  };

  const isAllSelected = (groupType: string) => {
    const group = permissions.find(g => g.type === groupType);
    if (!group) return false;
    return group.permissions.every(permission => selectedPermissions[permission.id.toString()]);
  };

  const getSelectedCount = (groupType: string) => {
    const group = permissions.find(g => g.type === groupType);
    if (!group) return 0;
    return group.permissions.filter(permission => selectedPermissions[permission.id.toString()]).length;
  };

  return (
    <UserProfileLayout user={user} activeTab="permissions">
      <div className="space-y-6">
        <Card className="rounded-xs border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">User Permissions</CardTitle>
            <CardDescription>Manage and configure user access rights and system permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <Accordion type="multiple" className="w-full space-y-4" defaultValue={permissions.map(item => item.type)}>
                {permissions.map(item => (
                  <AccordionItem key={item.type} value={item.type} className="mb-4 border">
                    <AccordionTrigger className="rounded-none border-b bg-gray-50 p-4 hover:no-underline">
                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-accent-foreground font-medium">{item.title}</h3>
                          <span className="text-muted-foreground text-xs">Permission settings for {item.title.toLowerCase()}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6">
                      <div className="mb-4 flex items-center justify-between border-b pb-3">
                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getSelectedCount(item.type)} of {item.permissions.length}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xs text-xs text-gray-500 hover:text-gray-700"
                            onClick={e => {
                              e.stopPropagation();
                              handleSelectAll(item.type, !isAllSelected(item.type));
                            }}
                          >
                            {isAllSelected(item.type) ? 'Deselect all' : 'Select all'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {item.permissions.map(permission => (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 rounded-xs bg-gray-50/50 p-3 transition-colors hover:bg-gray-100"
                          >
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={selectedPermissions[permission.id.toString()] || false}
                              onCheckedChange={checked => handlePermissionToggle(permission.id.toString(), checked as boolean)}
                              className="mt-0.5 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                            />
                            <div className="grid gap-2">
                              <Label htmlFor={`permission-${permission.id}`} className="flex cursor-pointer gap-2 text-sm font-medium text-gray-900">
                                {permission.title}
                                {(permission.action.includes('manage') || permission.action.includes('revoke')) && (
                                  <Badge variant="secondary" className="justify-end bg-orange-100 text-xs text-orange-800">
                                    Administrative
                                  </Badge>
                                )}
                              </Label>
                              <p className="text-muted-foreground text-xs">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="py-8 text-center">
                <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions configured</h3>
                <p className="text-muted-foreground mt-1 text-sm">This user has no specific permissions assigned yet.</p>
                <Button variant="secondary" className="mt-4 rounded-xs">
                  Assign Permissions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserProfileLayout>
  );
}
