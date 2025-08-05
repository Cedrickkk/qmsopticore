// New file: c:\Users\Cedric\Desktop\qmsopticore\resources\js\components\user-access-table.tsx
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserRoleBadge } from '@/lib/role';
import { Document } from '@/types/document';
import { useForm } from '@inertiajs/react';
import { Save, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentSignatory } from './document-info';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface User {
  id: number;
  name: string;
  email: string;
  position: string;
  avatar: string | null;
}

type UserAccess = {
  user: User;
  role: 'signatory' | 'recipient';
  permissions: {
    view: boolean;
    edit: boolean;
    download: boolean;
    share: boolean;
  };
};

type UserAccessFormData = {
  users: Array<{
    id: number;
    permissions: {
      view: boolean;
      edit: boolean;
      download: boolean;
      share: boolean;
    };
  }>;
};

type UserAccessTableProps = {
  document: Document & {
    signatories: DocumentSignatory[];
    recipients?: Array<{
      id: number;
      user: {
        id: number;
        name: string;
        position: string;
        avatar: string | null;
      };
    }>;
  };
};

export default function UserAccessTable({ document }: UserAccessTableProps) {
  const [users, setUsers] = useState<UserAccess[]>(() => {
    const allUsers: UserAccess[] = [];

    document.signatories.forEach(signatory => {
      allUsers.push({
        user: {
          id: signatory.user.id,
          name: signatory.user.name,
          email: signatory.user.email || '',
          position: signatory.user.position,
          avatar: signatory.user.avatar || null,
        },
        role: 'signatory',
        permissions: {
          view: true,
          edit: signatory.status === 'approved',
          download: true,
          share: signatory.status === 'approved',
        },
      });
    });

    document.recipients?.forEach(recipient => {
      const existingUser = allUsers.find(u => u.user.id === recipient.user.id);
      if (!existingUser) {
        allUsers.push({
          user: {
            id: recipient.user.id,
            name: recipient.user.name,
            email: '',
            position: recipient.user.position,
            avatar: recipient.user.avatar || null,
          },
          role: 'recipient',
          permissions: {
            view: true,
            edit: false,
            download: false,
            share: false,
          },
        });
      }
    });

    return allUsers;
  });

  // TODO: Feat: Implement user search for managing document access

  const { post, processing } = useForm<UserAccessFormData>();

  const updatePermission = (userId: number, permission: keyof UserAccess['permissions'], value: boolean) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.user.id === userId
          ? {
              ...user,
              permissions: {
                ...user.permissions,
                [permission]: value,
              },
            }
          : user
      )
    );
  };

  // TODO: Save changes to the database
  const saveChanges = () => {
    post(`/documents/${document.id}/access`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Document access permissions updated successfully');
      },
      onError: () => {
        toast.error('Failed to update document access permissions');
      },
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex w-full items-center justify-start gap-2 rounded-xs">
          <Users className="h-4 w-4" />
          Manage Access
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-4xl min-w-[60vw] p-6">
        <SheetHeader className="mb-6 border-b border-gray-200 pb-4">
          <SheetTitle className="text-xl font-semibold text-gray-900">Manage Document Access</SheetTitle>
          <SheetDescription className="text-gray-600">Control who can view and interact with "{document.title}"</SheetDescription>
        </SheetHeader>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="w-[280px] px-6 py-4 text-left font-semibold">User</TableHead>
                    <TableHead className="center px-4 py-4 text-left font-semibold">Role</TableHead>
                    <TableHead className="center px-4 py-4 text-left font-semibold">View</TableHead>
                    <TableHead className="center px-4 py-4 text-left font-semibold">Edit</TableHead>
                    <TableHead className="center px-4 py-4 text-left font-semibold">Share</TableHead>
                    <TableHead className="center px-4 py-4 text-left font-semibold">Download</TableHead>
                    <TableHead className="w-[70px] px-4 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                        No users have access to this document.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(userAccess => (
                      <TableRow key={userAccess.user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarImage src={userAccess.user.avatar || undefined} alt={userAccess.user.name} />
                              <AvatarFallback className="bg-gray-100 font-medium text-gray-700">{userAccess.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{userAccess.user.name}</p>
                              <p className="text-sm text-gray-600">{userAccess.user.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-left">
                          <span>{getUserRoleBadge(userAccess.role)}</span>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-left">
                          <Checkbox
                            checked={userAccess.permissions.view}
                            onCheckedChange={checked => updatePermission(userAccess.user.id, 'view', checked === true)}
                            className="border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4 text-left">
                          <Checkbox
                            checked={userAccess.permissions.edit}
                            onCheckedChange={checked => updatePermission(userAccess.user.id, 'edit', checked === true)}
                            className="border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4 text-left">
                          <Checkbox
                            checked={userAccess.permissions.share}
                            onCheckedChange={checked => updatePermission(userAccess.user.id, 'share', checked === true)}
                            className="border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4 text-left">
                          <Checkbox
                            checked={userAccess.permissions.download}
                            onCheckedChange={checked => updatePermission(userAccess.user.id, 'download', checked === true)}
                            className="border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xs p-0 text-red-600 hover:bg-red-50 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-gray-600">
              {users.length} user{users.length !== 1 ? 's' : ''} with access
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="rounded-xs">
                Add User
              </Button>
              <Button onClick={saveChanges} disabled={processing} className="flex items-center gap-2 rounded-xs">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
