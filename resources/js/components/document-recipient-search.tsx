import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserServiceApi } from '@/services/app';
import { type DocumentUser } from '@/types/document';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface RecipientSearchProps {
  onAddUser: (user: DocumentUser) => void;
}

export function RecipientSearch({ onAddUser }: RecipientSearchProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchUser = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await UserServiceApi.searchByEmail(email);

      if (response.user) {
        const documentUser: DocumentUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          signatory: false,
        };

        onAddUser(documentUser);
        setEmail('');
      } else if (response.message) {
        setError(response.message);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('Failed to search user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recipients">Search Recipients</Label>
        <div className="flex items-center gap-4">
          <Input id="recipients" type="email" placeholder="Search email..." value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
          <Button variant="secondary" onClick={handleSearchUser} disabled={!email || isLoading}>
            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Add'}
          </Button>
        </div>
        {error && <InputError message={error} />}
      </div>
    </div>
  );
}
