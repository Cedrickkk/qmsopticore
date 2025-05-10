import InputError from '@/components/input-error';
import PrivacyPolicy from '@/components/privacy-policy';
import TermsOfUse from '@/components/terms-of-use';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppearance } from '@/hooks/use-appearance';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { Department } from '@/pages/accounts/create';
import { Head, useForm, usePage } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast, Toaster } from 'sonner';

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  department: string;
  role: string;
};

export default function Register() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isLegalTermsAccepted, setIsLegalTermsAccepted] = useState(false);
  const { appearance } = useAppearance();
  const { data, setData, post, errors, processing, reset } = useForm<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
    role: 'regular_user',
  });

  const { departments } = usePage<{ departments: Department[] }>().props;

  const submit: FormEventHandler = e => {
    e.preventDefault();

    if (!isLegalTermsAccepted) {
      toast(
        <Alert variant="destructive" className="border-none p-0 font-sans">
          <AlertTitle>Terms and Conditions Required</AlertTitle>
          <AlertDescription>Please read and accept the Terms of Service and Privacy Policy to continue.</AlertDescription>
        </Alert>
      );
      return;
    }

    post('register', {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        toast(
          <Alert className="border-none p-0 font-sans">
            <AlertTitle className="flex items-center gap-1.5 font-medium text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check-circle"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Account Created Successfully
            </AlertTitle>
            <AlertDescription> The account was created successfully.</AlertDescription>
          </Alert>
        );
      },
    });
  };

  return (
    <>
      <AuthSimpleLayout title="Create an account" description="Enter your details below to create your account">
        <Head title="Register" />
        <form className="flex flex-col gap-6" onSubmit={submit}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                required
                autoFocus
                autoComplete="name"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                disabled={processing}
                placeholder="Fullname"
              />
              <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                disabled={processing}
                placeholder="email@example.com"
              />
              <InputError message={errors.email} />
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
              <InputError message={errors.department} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
                disabled={processing}
                placeholder="Password"
              />
              <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password_confirmation">Confirm password</Label>
              <Input
                id="password_confirmation"
                type="password"
                required
                autoComplete="new-password"
                value={data.password_confirmation}
                onChange={e => setData('password_confirmation', e.target.value)}
                disabled={processing}
                placeholder="Confirm password"
              />
              <InputError message={errors.password_confirmation} />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="terms"
                disabled={processing}
                checked={isLegalTermsAccepted}
                onCheckedChange={checked => setIsLegalTermsAccepted(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I accept the&nbsp;
                  <Button type="button" className={'underline'} variant={'link'} onClick={() => setIsTermsModalOpen(true)}>
                    Terms of Service and Privacy Policy
                  </Button>
                </Label>
              </div>
            </div>

            <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
              {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            <TextLink href={route('login')} tabIndex={6}>
              Log in
            </TextLink>
          </div>
        </form>
        <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
          <DialogContent className="flex min-h-[90vh] max-w-[600px] flex-col rounded-xs md:max-w-4xl">
            <DialogDescription className="sr-only">This is the terms of service and privacy policy.</DialogDescription>
            <DialogHeader>
              <DialogTitle className="text-xl">Terms of Service & Privacy Policy</DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex h-[80vh]">
              <TermsOfUse />
              <Separator className="my-9" />
              <PrivacyPolicy />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </AuthSimpleLayout>

      <Toaster theme={appearance} duration={10000} />
    </>
  );
}
