import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { DocumentType } from '@/types/document';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

type PageProps = {
  options: {
    types: DocumentType[];
  };
};

const settingsOptions = [
  {
    title: 'Appearance',
    value: 'appearance',
  },
  {
    title: 'Database Backup',
    value: 'backup',
  },
  {
    title: 'Content Management',
    value: 'content',
  },
  {
    title: 'Documents',
    value: 'documents',
  },
];

type SettingsTabValue = 'appearance' | 'backup' | 'content' | 'documents';

export default function SystemSettings() {
  const [tab, setTab] = useState<SettingsTabValue>('documents');
  const { options } = usePage<PageProps>().props;

  const handleTabChange = (value: SettingsTabValue) => {
    setTab(value);
  };

  return (
    <AppLayout>
      <Head title="System Settings" />
      System Settings
      <Tabs value={tab} onValueChange={value => handleTabChange(value as SettingsTabValue)}>
        <TabsList className="bg-white">
          {settingsOptions.map(option => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              onClick={() => handleTabChange(option.value as SettingsTabValue)}
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground rounded-xs px-1.5 py-2"
            >
              {option.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-8">
          <TabsContent value="appearance">
            <h5 className="text-lg font-medium">Appearance</h5>
            <p className="text-muted-foreground text-sm">Customize the appearance of your application.</p>
            <Separator className="my-6" />

            <div className="grid grid-cols-2 items-center">
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium">Brand Color</p>
                <p className="text-muted-foreground text-sm">Select or customize your brand color.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary h-6 w-6 rounded-xs" />
                <Button variant="outline">#16a34a</Button>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 items-center">
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium">Dashboard Chart</p>
                <p className="text-muted-foreground text-sm">How chart are displayed.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary h-6 w-6 rounded-xs" />
                <Button variant="outline">#16a34a</Button>
                <div className="bg-primary h-6 w-6 rounded-xs" />
                <Button variant="outline">#16a34a</Button>
                <div className="bg-primary h-6 w-6 rounded-xs" />
                <Button variant="outline">#16a34a</Button>
              </div>
            </div>
            <Separator className="my-6" />

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </TabsContent>
          <TabsContent value="backup">
            <h5 className="text-lg font-medium">Database Backup</h5>
            <p className="text-muted-foreground text-sm">Manage your database backups.</p>
          </TabsContent>
          <TabsContent value="content">
            <h5 className="text-lg font-medium">Content Management</h5>
            <p className="text-muted-foreground text-sm">Manage your application's content.</p>
          </TabsContent>
        </div>
        <TabsContent value="documents">
          <h5 className="text-lg font-medium">Document Options</h5>
          <p className="text-muted-foreground text-sm">Manage your document options.</p>
          <Table className="mt-8">
            <TableCaption>A list of document option and categories.</TableCaption>
            <TableHeader className="bg-primary rounded-xs dark:bg-[var(--primary-light)]!">
              <TableRow>
                <TableHead className="w-[300px] p-3 text-white">Type</TableHead>
                <TableHead className="text-white">Categories</TableHead>
                <TableHead className="p-3 text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.types.map(option => {
                return (
                  <TableRow key={option.id}>
                    <TableCell className="p-3">{option.name}</TableCell>
                    <TableCell className="p-3">
                      {option.categories.map(category => (
                        <span>{category.name}, </span>
                      ))}
                    </TableCell>
                    <TableCell className="flex items-center text-right">
                      <Button variant="link">Edit</Button>
                      <Button variant="link" className="text-destructive">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
