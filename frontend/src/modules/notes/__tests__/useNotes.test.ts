import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotes } from '../hooks/useNotes';
import { notesService } from '../services/notesService';

vi.mock('../services/notesService', () => ({
  notesService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchNotes', () => {
    it('should fetch notes successfully', async () => {
      const mockNotes = [
        { id: 1, title: 'Note 1', user_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, title: 'Note 2', user_id: 1, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ];

      vi.mocked(notesService.getAll).mockResolvedValue({ data: mockNotes });

      const { result } = renderHook(() => useNotes());

      await act(async () => {
        await result.current.fetchNotes();
      });

      await waitFor(() => {
        expect(result.current.notes).toEqual(mockNotes);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
      });
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch');
      vi.mocked(notesService.getAll).mockRejectedValue(error);

      const { result } = renderHook(() => useNotes());

      await act(async () => {
        await result.current.fetchNotes();
      });

      await waitFor(() => {
        expect(result.current.notes).toEqual([]);
        expect(result.current.error).toBe('Failed to fetch');
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('createNote', () => {
    it('should create note successfully', async () => {
      const newNote = { id: 3, title: 'New Note', user_id: 1, created_at: '2024-01-03', updated_at: '2024-01-03' };
      vi.mocked(notesService.create).mockResolvedValue({ data: newNote });

      const { result } = renderHook(() => useNotes());

      let createdNote: any;
      await act(async () => {
        createdNote = await result.current.createNote('New Note');
      });

      expect(createdNote).toEqual(newNote);
      expect(result.current.notes).toContainEqual(newNote);
    });

    it('should handle create errors', async () => {
      const error = new Error('Failed to create');
      vi.mocked(notesService.create).mockRejectedValue(error);

      const { result } = renderHook(() => useNotes());

      let thrownError;
      try {
        await act(async () => {
          await result.current.createNote('New Note');
        });
      } catch (e: any) {
        thrownError = e;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError.message).toBe('Failed to create');
      
      // Verify error state is set
      expect(result.current.loading).toBe(false);
    });
  });

  describe('updateNote', () => {
    it('should update note successfully', async () => {
      const existingNotes = [
        { id: 1, title: 'Note 1', user_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ];
      const updatedNote = { ...existingNotes[0], title: 'Updated Note' };

      vi.mocked(notesService.getAll).mockResolvedValue({ data: existingNotes });
      vi.mocked(notesService.update).mockResolvedValue({ data: updatedNote });

      const { result } = renderHook(() => useNotes());

      await act(async () => {
        await result.current.fetchNotes();
      });

      await act(async () => {
        await result.current.updateNote(1, 'Updated Note');
      });

      expect(result.current.notes[0].title).toBe('Updated Note');
    });
  });

  describe('deleteNote', () => {
    it('should delete note successfully', async () => {
      const existingNotes = [
        { id: 1, title: 'Note 1', user_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, title: 'Note 2', user_id: 1, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ];

      vi.mocked(notesService.getAll).mockResolvedValue({ data: existingNotes });
      vi.mocked(notesService.delete).mockResolvedValue();

      const { result } = renderHook(() => useNotes());

      await act(async () => {
        await result.current.fetchNotes();
      });

      await act(async () => {
        await result.current.deleteNote(1);
      });

      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].id).toBe(2);
    });
  });
});
