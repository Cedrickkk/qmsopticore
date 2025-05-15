import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AccountInformation from '@/components/user-account-info';
import { ProfileInformation } from '@/components/user-profile-info';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Accounts',
    href: '/accounts',
  },
  {
    title: 'Create',
    href: '/accounts/create',
  },
];

/**
 * TODO: Fix type clutter here
 */

export type Department = {
  id: number;
  name: string;
};

export type Roles = {
  id: number;
  name: string;
};

export type CreateAccountFormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  department: string;
  position: string;
  image: File | null;
  signatures: File[];
  role: string;
};

export default function Create() {
  const [isSignaturesValidated, setIsSignaturesValidated] = useState(false);
  const { data, setData, post, errors, processing, reset } = useForm<CreateAccountFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    position: '',
    department: '',
    image: null as File | null,
    signatures: [] as File[],
    role: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignaturesValidated && data.signatures.length >= 7) {
      toast(
        <Alert className="border-none p-0 font-sans" variant="destructive">
          <AlertTitle>Validated Signatures Required</AlertTitle>
          <AlertDescription>Please validate the signatures before creating the account.</AlertDescription>
        </Alert>
      );
      return;
    }

    post('/accounts/create', {
      forceFormData: true,
      preserveScroll: true,
      showProgress: false,
      onSuccess: () => {
        setData('image', null);
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
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Account" />
      <div className="max-w- space-y-6 px-4 py-6">
        <Heading title="Create User" description="Create a new user account" />
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <ProfileInformation
            data={data}
            errors={errors}
            setData={setData}
            processing={processing}
            onSignaturesValidated={() => setIsSignaturesValidated(true)}
            onSignaturesChanged={() => setIsSignaturesValidated(false)}
          />
          <AccountInformation data={data} errors={errors} setData={setData} processing={processing} />
          <Button disabled={processing}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
