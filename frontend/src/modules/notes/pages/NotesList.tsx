import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@modules/auth';
import { useNotes } from '../hooks/useNotes';
import { NoteCard } from '../components/NoteCard';
import { CreateNoteForm } from '../components/CreateNoteForm';

export function NotesList() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user, logout } = useAuth();
  const { notes, loading, error, fetchNotes, createNote, deleteNote } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (title: string) => {
    try {
      await createNote(title);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteNote(id);
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  const handleEditNote = (id: number) => {
    navigate(`/notes/${id}`);
  };

  if (loading && notes.length === 0) {
    return <div className="loading">Loading notes...</div>;
  }

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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showCreateForm && (
          <CreateNoteForm
            onSubmit={handleCreateNote}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <div className="notes-grid">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
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
}
