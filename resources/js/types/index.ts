import { LucideIcon } from 'lucide-react';

export interface Auth {
  user: User;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
  requiredRoles?: UserRole[];
}

export interface SharedData {
  name: string;
  version: string;
  quote: { message: string };
  auth: Auth;
  [key: string]: unknown;
}

export interface UserPermissions {
  view: boolean;
  edit: boolean;
  download: boolean;
  delete: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  roles?: UserRole[];
  email_verified_at: string | null;
  defaultPermissions: UserPermissions;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export type PaginatedData<T> = {
  current_page: number;
  last_page: number;
  data: T[];
  first_page_url: string;
  last_page_url: string;
  from: number;
  to: number;
  links: Links[];
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  total: number;
};

export type Links = {
  url: string;
  label: string;
  active: boolean;
};

export type UserRole = 'super_admin' | 'department_admin' | 'regular_user';
