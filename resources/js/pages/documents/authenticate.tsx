import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Lock, Shield } from 'lucide-react';

type PageProps = {
  document: {
    id: number;
    title: string;
    code: string;
    confidentiality_level: 'public' | 'internal' | 'confidential' | 'highly_confidential';
  };
};

export default function Authenticate({ document }: PageProps) {
  const { data, setData, post, processing, errors } = useForm({
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/documents/${document.id}/authenticate`);
  };

  const getConfidentialityBadge = () => {
    const badges = {
      highly_confidential: { color: 'bg-red-100 text-red-800 border-red-200', label: 'HIGHLY CONFIDENTIAL' },
      confidential: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'CONFIDENTIAL' },
      internal: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'INTERNAL' },
      public: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'PUBLIC' },
    };

    const badge = badges[document.confidentiality_level];
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${badge.color}`}>
        <Shield className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <AppLayout>
      <Head title={`Authenticate - ${document.title}`} />

      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Lock className="text-primary h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground mt-2 text-sm">This document requires password verification to view</p>
          </div>

          {/* Document Info */}
          <div className="bg-card rounded-xs border p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">Document Code</p>
                <p className="font-mono text-sm">{document.code}</p>
              </div>
              {getConfidentialityBadge()}
            </div>
            <div className="mt-3">
              <p className="text-muted-foreground text-xs">Title</p>
              <p className="font-medium">{document.title}</p>
            </div>
          </div>

          {/* Security Notice */}
          <Alert className="rounded-xs">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              For security purposes, you must verify your identity with your password. This authentication will remain valid for 5 minutes of active
              viewing.
            </AlertDescription>
          </Alert>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Your Password</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
                placeholder="Enter your password"
                autoFocus
                className="rounded-xs"
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full rounded-xs" disabled={processing}>
              {processing ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-muted-foreground text-center text-xs">Your password is used only for verification and is not stored.</p>
        </div>
      </div>
    </AppLayout>
  );
}
