import { RecipientList } from '@/components/document-recipient-list';
import { RecipientSearch } from '@/components/document-recipient-search';
import InputError from '@/components/input-error';
import { CreateDocumentFormData, DocumentUser } from '@/types/document';

interface RecipientsProps {
  users: DocumentUser[];
  onChange: (users: DocumentUser[]) => void;
  errors: Partial<Record<keyof CreateDocumentFormData, string>>;
}

export function Recipients({ users, onChange, errors }: RecipientsProps) {
  const handleAddUser = (user: DocumentUser) => {
    const existingUser = users.find(u => u.id === user.id);
    if (!existingUser) {
      onChange([...users, { ...user, signatory: false }]);
    }
  };
  const handleRemoveUser = (userId: number) => {
    onChange(users.filter(user => user.id !== userId));
  };

  const handleSignatoryChange = (userId: number) => {
    onChange(users.map(user => (user.id === userId ? { ...user, signatory: !user.signatory } : user)));
  };

  return (
    <div className="space-y-4">
      <RecipientSearch onAddUser={handleAddUser} />
      {users.length > 0 && <RecipientList users={users} onSignatoryChange={handleSignatoryChange} onRemoveUser={handleRemoveUser} />}
      <InputError message={errors.users} />
    </div>
  );
}
