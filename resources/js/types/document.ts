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
  status: string;
  version: string;
  created_at: string;
  updated_at: string;
}
