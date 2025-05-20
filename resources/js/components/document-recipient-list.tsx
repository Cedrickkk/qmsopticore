import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useInitials } from '@/hooks/use-initials';
import { Trash2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface RecipientListProps {
  users: User[];
  onSignatoryChange: (userId: number) => void;
  onRemoveUser: (userId: number) => void;
}

export function RecipientList({ users, onSignatoryChange, onRemoveUser }: RecipientListProps) {
  const getInitials = useInitials();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm leading-none font-medium">Recipients</p>
        <small className="text-muted-foreground block text-xs">
          Note: Please arrange the users based on the order in which they will sign the document.
        </small>
      </div>

      <div className="divide-y">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between gap-5 py-3">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm leading-none font-medium">{user.name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id={`signatory-${user.id}`} onCheckedChange={() => onSignatoryChange(user.id)} />
                <label
                  htmlFor={`signatory-${user.id}`}
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Signatory
                </label>
              </div>

              <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveUser(user.id)}>
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
