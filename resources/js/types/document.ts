export interface Document {
  id: number;
  code: string;
  title: string;
  creator: {
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
