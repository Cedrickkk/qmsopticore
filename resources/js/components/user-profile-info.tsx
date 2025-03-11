import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateAccountFormData, Department } from '@/pages/accounts/create';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';

/**
 *
 * ? Maybe use zod validator for client side validation
 *
 */

interface ProfileInformationProps {
  data: CreateAccountFormData;
  errors: Partial<Record<keyof CreateAccountFormData | `signatures.${number}`, string>>;
  setData: (key: keyof CreateAccountFormData, value: string | File | File[] | null) => void;
}

export function ProfileInformation({ data, setData, errors }: ProfileInformationProps) {
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const { departments } = usePage<{ departments: Department[] }>().props;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const existingFiles = data.signatures ? Array.from(data.signatures) : [];
    const uniqueNewFiles = newFiles.filter(newFile => !existingFiles.some(existingFile => existingFile.name === newFile.name));
    setData('signatures', [...existingFiles, ...uniqueNewFiles]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      const imageUrl = URL.createObjectURL(file);
      setProfileImageUrl(imageUrl);
    }
  };

  const filterSignature = (name: string) => {
    const filteredSignatures = data.signatures?.filter(signature => signature.name !== name);

    if (!filteredSignatures) return;
    setData('signatures', [...filteredSignatures]);
  };

  const getSignatureError = (index: number) => {
    return errors[`signatures.${index}`];
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
        <InputError message={errors.image} className="mt-2" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullname">Fullname</Label>
        <Input
          id="fullname"
          type="text"
          name="fullname"
          className="mt-1 block w-full"
          value={data.name}
          onChange={e => setData('name', e.target.value)}
        />
        <InputError message={errors.name} className="mt-2" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          className="mt-1 block w-full"
          value={data.email}
          onChange={e => setData('email', e.target.value)}
        />
        {!errors.email ? (
          <p className="text-muted-foreground text-xs">This public email address will be used for sending and receiving documents.</p>
        ) : (
          <InputError message={errors.email} className="mt-2" />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select value={data.department} onValueChange={value => setData('department', value)}>
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

      <div className="space-y-2">
        <Label htmlFor="signatures">Signatures</Label>
        <Input
          id="signatures"
          multiple
          type="file"
          name="signatures"
          accept="image/png, image/jpg, image/jpeg"
          className="mt-1 block w-full"
          onChange={handleFileChange}
        />
        <InputError message={errors.signatures} className="mt-2" />
        {data.signatures &&
          data.signatures.map((file, index) => {
            const error = getSignatureError(index);
            return (
              <div className="ring-offset-background mt-1 space-y-1" key={file.name}>
                <div className="flex h-10 w-full items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-sm">
                  <p>{file.name}</p>
                  <Button variant="ghost" size="icon" type="button" onClick={() => filterSignature(file.name)} className="cursor-pointer">
                    <X className="text-red-500" />
                  </Button>
                </div>
                {error && <InputError message={error} className="text-xs" />}
              </div>
            );
          })}
      </div>
    </div>
  );
}
