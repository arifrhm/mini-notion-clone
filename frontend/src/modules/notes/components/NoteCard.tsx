import { Note } from '../types';
import { formatDate } from '@shared';

interface NoteCardProps {
  note: Note;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="note-card">
      <div className="note-card-content" onClick={() => onEdit(note.id)}>
        <h3>{note.title}</h3>
        <p className="note-meta">
          Updated: {formatDate(note.updated_at)}
        </p>
      </div>
      <div className="note-card-actions">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(note.id);
          }}
          className="btn-secondary"
        >
          Edit
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
