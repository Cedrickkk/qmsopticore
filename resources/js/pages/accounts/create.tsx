import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AccountInformation from '@/components/user-account-info';
import { ProfileInformation } from '@/components/user-profile-info';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

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
  image: File | null;
  signatures: File[];
  role: string;
};

export default function Create() {
  const { data, setData, post, errors, processing } = useForm<CreateAccountFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
    image: null as File | null,
    signatures: [] as File[],
    role: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/accounts/create', {
      forceFormData: true,
      preserveScroll: true,
      showProgress: false,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Account" />
      <div className="max-w- space-y-6 px-4 py-6">
        <Heading title="Create User" description="Create a new user account" />
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <ProfileInformation data={data} errors={errors} setData={setData} processing={processing} />
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
