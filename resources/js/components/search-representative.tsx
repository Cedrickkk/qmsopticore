import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserServiceApi } from '@/services/app';
import { User } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface RepresentativeSearchProps {
  onSelectUser: (user: User) => void;
}

export function RepresentativeSearch({ onSelectUser }: RepresentativeSearchProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchUser = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);

    const { user, error: searchError } = await UserServiceApi.searchRepresentativeByEmail(email);

    if (user) {
      onSelectUser(user);
      setEmail('');
      setError(null);
      setIsLoading(false);
    }

    if (searchError) {
      setEmail('');
      setError(searchError);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Representative</Label>
        <div className="flex items-center gap-4">
          <Input
            id="search"
            type="email"
            placeholder="Search email..."
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 rounded-xs"
          />
          <Button variant="secondary" onClick={handleSearchUser} disabled={!email || isLoading} className="rounded-xs">
            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Search'}
          </Button>
        </div>
        {error && <InputError message={error} />}
        <p className="text-muted-foreground text-xs">Search for a user in your department by their email address</p>
      </div>
    </div>
  );
}
