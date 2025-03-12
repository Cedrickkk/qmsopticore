import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateAccountFormData } from '@/pages/accounts/create';

interface AccountInformationProps {
  data: CreateAccountFormData;
  errors: Partial<Record<keyof CreateAccountFormData, string>>;
  setData: (key: keyof CreateAccountFormData, value: string) => void;
  processing: boolean;
}

export default function AccountInformation({ data, errors, setData, processing }: AccountInformationProps) {
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
    </div>
  );
}
