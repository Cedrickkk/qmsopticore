import { DocumentCategoryField } from '@/components/document-category-field';
import { Recipients } from '@/components/document-recipient';
import { DocumentTypeField } from '@/components/document-type-field';
import { DocumentUpload } from '@/components/document-upload';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CreateDocumentFormData, DocumentType } from '@/types/document';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Documents',
    href: '/documents',
  },
  {
    title: 'Create',
    href: '/documents/create',
  },
];

type PageProps = {
  options: {
    types: DocumentType[];
  };
  canManageAccess: boolean;
};

export default function Create() {
  const { options } = usePage<PageProps>().props;

  const { data, setData, errors, post, processing, reset } = useForm<CreateDocumentFormData>({
    file: null,
    type: {
      id: null,
      name: '',
    },
    category: {
      id: null,
      name: '',
    },
    description: '',
    users: [],
    permissions: [],
  });

  const selectedTypeCategories = options.types.find(type => type.name === data.type.name)?.categories || [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/documents/create', {
      forceFormData: true,
      preserveScroll: true,
      preserveState: true,
      showProgress: false,
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
              Document Sent Successfully
            </AlertTitle>
            <AlertDescription> The document was sent successfully.</AlertDescription>
          </Alert>
        );
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Documents" />
      <form onSubmit={handleSubmit}>
        <div className="my-4 flex flex-col gap-4 md:grid lg:grid-cols-2 lg:gap-6">
          <DocumentUpload file={data.file} onChange={file => setData('file', file)} error={errors.file} />
          <div className="space-y-5">
            <DocumentTypeField value={data.type} onChange={type => setData('type', type)} types={options.types} errors={errors} />
            <DocumentCategoryField
              value={data.category}
              onChange={category => setData('category', category)}
              categories={selectedTypeCategories}
              errors={errors}
            />
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="rounded-sm" value={data.description} onChange={e => setData('description', e.target.value)} />
              <InputError message={errors.description} />
            </div>
            <Recipients users={data.users} onChange={users => setData('users', users)} errors={errors} />
            <Button className="w-full" disabled={processing}>
              {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
