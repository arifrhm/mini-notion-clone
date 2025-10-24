export interface User {
  id: number;
  email: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  blocks?: Block[];
  last_edited_by?: number;
  created_at: string;
  updated_at: string;
}

export enum BlockType {
  TEXT = 'text',
  CHECKLIST = 'checklist',
  IMAGE = 'image',
  CODE = 'code'
}

export interface Block {
  id: number;
  note_id: number;
  parent_id?: number;
  type: BlockType;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
