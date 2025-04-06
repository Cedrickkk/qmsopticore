// New file: c:\Users\Cedric\Desktop\qmsopticore\resources\js\components\user-access-table.tsx
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Document } from '@/types/document';
import { useForm } from '@inertiajs/react';
import { PlusCircle, Save, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentSignatory } from './document-info';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface User {
  id: number;
  name: string;
  email: string;
  position: string;
  avatar: string | null;
}

type UserAccess = {
  user: User;
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
  };
};

export default function UserAccessTable({ document }: UserAccessTableProps) {
  // In a real application, fetch this data from the server
  const [users, setUsers] = useState<UserAccess[]>([
    {
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        position: 'Department Manager',
        avatar: null,
      },
      permissions: {
        view: true,
        edit: false,
        download: true,
        share: false,
      },
    },
    {
      user: {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        position: 'Team Lead',
        avatar: null,
      },
      permissions: {
        view: true,
        edit: true,
        download: true,
        share: true,
      },
    },
  ]);

  // TODO: Feat: Implement user search for managing document access
  // const { search, handleSearch, isProcessing } = useDebouncedSearch({ resource: '/users/search' });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert@example.com',
      position: 'Senior Developer',
      avatar: null,
    },
    {
      id: 4,
      name: 'Emily Wilson',
      email: 'emily@example.com',
      position: 'HR Specialist',
      avatar: null,
    },
  ]);

  const filteredUsers = users.filter(
    user =>
      user.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const addUser = (userId: number) => {
    const userToAdd = availableUsers.find(user => user.id === userId);
    if (!userToAdd) return;

    setUsers([
      ...users,
      {
        user: userToAdd,
        permissions: {
          view: true,
          edit: false,
          download: false,
          share: false,
        },
      },
    ]);

    setAvailableUsers(availableUsers.filter(user => user.id !== userId));
    setShowAddUser(false);
  };

  const removeUser = (userId: number) => {
    const userToRemove = users.find(user => user.user.id === userId);
    if (!userToRemove) return;

    setUsers(users.filter(user => user.user.id !== userId));
    setAvailableUsers([...availableUsers, userToRemove.user]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input placeholder="Search users..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAddUser(!showAddUser)} className="flex items-center gap-1">
          {showAddUser ? (
            <>
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </>
          )}
        </Button>
      </div>

      {showAddUser && (
        <div className="rounded-md border p-4">
          <h3 className="mb-3 font-medium">Add User Access</h3>
          <div className="space-y-2">
            {availableUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No more users available to add</p>
            ) : (
              availableUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-muted-foreground text-xs">{user.position}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => addUser(user.id)} className="flex h-8 w-8 p-0">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead className="text-center">View</TableHead>
              <TableHead className="text-center">Edit</TableHead>
              <TableHead className="text-center">Download</TableHead>
              <TableHead className="text-center">Share</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(userAccess => (
                <TableRow key={userAccess.user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userAccess.user.avatar || undefined} alt={userAccess.user.name} />
                        <AvatarFallback>{userAccess.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{userAccess.user.name}</p>
                        <p className="text-muted-foreground text-xs">{userAccess.user.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={userAccess.permissions.view}
                              onCheckedChange={checked => updatePermission(userAccess.user.id, 'view', checked === true)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Can view the document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={userAccess.permissions.edit}
                              onCheckedChange={checked => updatePermission(userAccess.user.id, 'edit', checked === true)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Can edit the document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={userAccess.permissions.download}
                              onCheckedChange={checked => updatePermission(userAccess.user.id, 'download', checked === true)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Can download the document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <Checkbox
                              checked={userAccess.permissions.share}
                              onCheckedChange={checked => updatePermission(userAccess.user.id, 'share', checked === true)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Can share the document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUser(userAccess.user.id)}
                      className="text-destructive hover:text-destructive flex h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveChanges} disabled={processing} className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
