import { Block } from '@modules/blocks/types';

export interface Note {
  id: number;
  user_id: number;
  title: string;
  blocks?: Block[];
  last_edited_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDto {
  title: string;
}

export interface UpdateNoteDto {
  title?: string;
}

export interface NotesResponse {
  success: boolean;
  data: Note[];
}

export interface NoteResponse {
  success: boolean;
  data: Note;
}
