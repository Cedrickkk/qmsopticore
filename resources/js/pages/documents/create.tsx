import { DocumentCategoryField } from '@/components/document-category-field';
import { Recipients } from '@/components/document-recipient';
import { DocumentTypeField } from '@/components/document-type-field';
import { DocumentUpload } from '@/components/document-upload';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CreateDocumentFormData, DocumentType } from '@/types/document';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

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
};

export default function Create() {
  const { options } = usePage<PageProps>().props;

  const { data, setData, errors, post, processing } = useForm<CreateDocumentFormData>({
    file: null,
    type: {
      id: null,
      name: '',
    },
    category: {
      id: null,
      name: '',
    },
    users: [],
  });

  const selectedTypeCategories = options.types.find(type => type.name === data.type.name)?.categories || [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/documents/create', {
      forceFormData: true,
      preserveScroll: true,
      preserveState: true,
      showProgress: false,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Documents" />
      <form onSubmit={handleSubmit}>
        <div className="my-4 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
          <DocumentUpload file={data.file} onChange={file => setData('file', file)} error={errors.file} />
          <div className="space-y-5">
            <DocumentTypeField value={data.type} onChange={type => setData('type', type)} types={options.types} errors={errors} />
            <DocumentCategoryField
              value={data.category}
              onChange={category => setData('category', category)}
              categories={selectedTypeCategories}
              errors={errors}
            />
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
