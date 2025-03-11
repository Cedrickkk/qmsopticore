import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { ProfileInformation } from '@/components/user-profile-info';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

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

export type Department = {
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
};

export default function Create() {
  const { data, setData, post, errors } = useForm<CreateAccountFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
    image: null as File | null,
    signatures: [] as File[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/accounts/create', {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Account" />
      <div className="max-w- space-y-6 px-4 py-6">
        <Heading title="Create User" description="Create a new user account" />
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <ProfileInformation data={data} errors={errors} setData={setData} />
          <Button type="submit" className="rounded-sm">
            Submit
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
