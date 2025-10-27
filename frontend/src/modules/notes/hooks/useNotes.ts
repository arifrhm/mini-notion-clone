import { useState, useCallback } from 'react';
import { notesService } from '../services/notesService';
import { Note } from '../types';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesService.getAll();
      setNotes(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (title: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesService.create({ title });
      setNotes(prev => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNote = useCallback(async (id: number, title: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesService.update(id, { title });
      setNotes(prev => prev.map(note => note.id === id ? response.data : note));
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update note');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNote = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await notesService.delete(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}
