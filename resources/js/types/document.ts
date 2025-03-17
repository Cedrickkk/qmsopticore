/**
 *
 * TODO: Fix type clutter
 *
 */

export interface Document {
  id: number;
  code: string;
  title: string;
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

export type CreateDocumentFormData = {
  file: File | null;
  type: Omit<DocumentType, 'categories'>;
  category: DocumentCategory;
  users: DocumentUser[];
};

export type DocumentPageProps = {
  options: {
    types: DocumentType[];
  };
};
