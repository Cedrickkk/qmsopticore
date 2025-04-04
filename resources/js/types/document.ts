/**
 *
 * TODO: Fix type clutter
 *
 */

export interface Document {
  id: number;
  code: string;
  title: string;
  description: string;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  };
  status: 'approved' | 'rejected' | 'pending' | 'updated';
  version: string;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory = {
  id: number | null;
  name: string;
};

export type DocumentType = {
  id: number | null;
  name: string;
  categories: DocumentCategory[];
};

export type DocumentUser = {
  id: number;
  name: string;
  email: string;
  signatory: boolean;
};

export type DocumentPermission = {
  userId: number;
  permissions: {
    view: boolean;
    edit: boolean;
    download: boolean;
    delete: boolean;
  };
};

export type CreateDocumentFormData = {
  file: File | null;
  type: {
    id: number | null;
    name: string;
  };
  category: {
    id: number | null;
    name: string;
  };
  users: DocumentUser[];
  description: string;
  permissions: DocumentPermission[];
};

export type DocumentPageProps = {
  options: {
    types: DocumentType[];
  };
};
