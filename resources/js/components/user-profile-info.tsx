import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateAccountFormData, Department } from '@/pages/accounts/create';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { SignatureUpload } from './signature-upload';

/**
 *
 * ? Maybe use zod validator for client side validation
 *
 */

interface ProfileInformationProps {
  data: CreateAccountFormData;
  errors: Partial<Record<keyof CreateAccountFormData | `signatures.${number}`, string>>;
  setData: (key: keyof CreateAccountFormData, value: string | File | File[] | null) => void;
  processing: boolean;
  onSignaturesValidated: () => void;
  onSignaturesChanged: () => void;
}

export function ProfileInformation({ data, setData, errors, processing, onSignaturesChanged, onSignaturesValidated }: ProfileInformationProps) {
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');

  const { departments } = usePage<{ departments: Department[] }>().props;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      const imageUrl = URL.createObjectURL(file);
      setProfileImageUrl(imageUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="image" />
        <div className="flex items-center gap-4 py-1">
          <Avatar className="size-20">
            <AvatarImage src={profileImageUrl} />
            <AvatarFallback>PLP</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Input type="file" id="image" accept=".png, .jpeg, .jpg" className="hidden" onChange={handleImageChange} />
            <Button className="w-fit cursor-pointer" variant="outline" asChild>
              <Label htmlFor="image">{profileImageUrl ? 'Change image' : 'Upload image'}</Label>
            </Button>
            <p className="text-muted-foreground text-xs">.png, .jpeg, .jpg file up to 1mb. Recommended size is 150x150px</p>
          </div>
        </div>
        <InputError message={errors.image} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullname">Name</Label>
        <Input
          id="fullname"
          type="text"
          name="fullname"
          className="mt-1 block w-full"
          value={data.name}
          disabled={processing}
          onChange={e => setData('name', e.target.value)}
        />
        <InputError message={errors.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          className="mt-1 block w-full"
          value={data.email}
          disabled={processing}
          autoComplete="email"
          onChange={e => setData('email', e.target.value)}
        />
        {!errors.email ? (
          <p className="text-muted-foreground text-xs">This public email address will be used for sending and receiving documents.</p>
        ) : (
          <InputError message={errors.email} />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select value={data.department} onValueChange={value => setData('department', value)} disabled={processing}>
          <SelectTrigger id="department" name="department" className="mt-1 w-full">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {departments &&
                departments.map(item => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <SignatureUpload
        signatures={data.signatures}
        onChange={files => setData('signatures', files)}
        errors={errors}
        disabled={processing}
        onChanged={onSignaturesChanged}
        onValidated={onSignaturesValidated}
      />
    </div>
  );
}
