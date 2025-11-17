/**
 *
 * TODO: Fix type clutter
 *
 */

import { ConfidentialityLevel } from '@/components/document-confidentiality-field';
import { PriorityType } from '@/lib/document-priority';

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
  status: 'approved' | 'rejected' | 'pending' | 'updated' | 'published';
  priority: 'normal' | 'high' | 'urgent';
  version: string;
  created_at: string;
  updated_at: string;
  confidentiality_level: 'public' | 'internal' | 'confidential';
  require_reauth_on_view: boolean;
  auto_blur_after_seconds: number;
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
  avatar: string;
  email: string;
  signatory: boolean;
};

export type DocumentPermission = {
  user: {
    id: number;
    name: string;
    email: string;
  };
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
  confidentiality_level: ConfidentialityLevel;
  priority: PriorityType;
};

export type DocumentPageProps = {
  options: {
    types: DocumentType[];
  };
};
