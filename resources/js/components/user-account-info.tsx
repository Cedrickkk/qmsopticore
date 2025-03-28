import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateAccountFormData, Roles } from '@/pages/accounts/create';
import { usePage } from '@inertiajs/react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AccountInformationProps {
  data: CreateAccountFormData;
  errors: Partial<Record<keyof CreateAccountFormData, string>>;
  setData: (key: keyof CreateAccountFormData, value: string) => void;
  processing: boolean;
}

export default function AccountInformation({ data, errors, setData, processing }: AccountInformationProps) {
  const { roles } = usePage<{ roles: Roles[] }>().props;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          className="mt-1"
          tabIndex={3}
          autoComplete="new-password"
          value={data.password}
          onChange={e => setData('password', e.target.value)}
          disabled={processing}
          placeholder="Password"
        />
        <InputError message={errors.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password_confirmation">Confirm password</Label>
        <Input
          id="password_confirmation"
          type="password"
          className="mt-1"
          tabIndex={4}
          autoComplete="new-password"
          value={data.password_confirmation}
          onChange={e => setData('password_confirmation', e.target.value)}
          disabled={processing}
          placeholder="Confirm password"
        />
        <InputError message={errors.password_confirmation} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password_confirmation">Role</Label>
        <Select value={data.role} onValueChange={value => setData('role', value)} disabled={processing}>
          <SelectTrigger id="department" name="department" className="mt-1 w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {roles &&
                roles.map(role => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <InputError message={errors.role} />
      </div>
    </div>
  );
}
