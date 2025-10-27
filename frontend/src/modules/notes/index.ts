// Notes Module Exports
export { notesService, NotesService } from './services/notesService';
export { useNotes } from './hooks/useNotes';

// Components
export { NoteCard } from './components/NoteCard';
export { CreateNoteForm } from './components/CreateNoteForm';

// Pages
export { NotesList } from './pages/NotesList';
export { NoteEditor } from './pages/NoteEditor';

export type {
  Note,
  CreateNoteDto,
  UpdateNoteDto,
  NotesResponse,
  NoteResponse,
} from './types';
