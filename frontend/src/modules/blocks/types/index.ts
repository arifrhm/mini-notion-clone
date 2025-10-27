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

export interface CreateBlockDto {
  type: BlockType;
  content: string;
  order_index: number;
  parent_id?: number;
}

export interface UpdateBlockDto {
  content?: string;
  order_index?: number;
  type?: BlockType;
}

export interface ReorderBlockDto {
  id: number;
  order_index: number;
}
