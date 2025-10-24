import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { notesApi } from '../services/api';
import { Note } from '../types';
import '../styles/notes.css';

interface CreateNoteFormData {
  title: string;
}

export const NotesList = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateNoteFormData>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await notesApi.getAll();
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to load notes', error);
    }
  };

  const onCreateNote = async (data: CreateNoteFormData) => {
    try {
      const response = await notesApi.create(data.title);
      setNotes([response.data, ...notes]);
      setShowCreateForm(false);
      reset();
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  return (
    <div className="notes-container">
      <header className="notes-header">
        <h1>My Notes</h1>
        <div className="header-actions">
          <span>Welcome, {user?.email}</span>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="notes-content">
        <div className="notes-actions">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            className="btn-primary"
          >
            + New Note
          </button>
        </div>

        {showCreateForm && (
          <div className="create-note-form">
            <form onSubmit={handleSubmit(onCreateNote)}>
              <input
                type="text"
                placeholder="Note title..."
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <span className="error">{errors.title.message}</span>}
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="notes-grid">
          {notes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-card-content" onClick={() => navigate(`/notes/${note.id}`)}>
                <h3>{note.title}</h3>
                <p className="note-meta">
                  Updated: {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="note-card-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/notes/${note.id}`);
                  }}
                  className="btn-secondary"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {notes.length === 0 && !showCreateForm && (
          <div className="empty-state">
            <p>No notes yet. Create your first note to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
