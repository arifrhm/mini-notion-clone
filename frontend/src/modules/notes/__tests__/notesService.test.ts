import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { NotesService } from '../services/notesService';

vi.mock('axios');

describe('NotesService', () => {
  let notesService: NotesService;
  let mockAxios: any;

  beforeEach(() => {
    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    vi.mocked(axios.create).mockReturnValue(mockAxios as any);
    notesService = new NotesService();
  });

  describe('getAll', () => {
    it('should fetch all notes', async () => {
      const mockNotes = [
        { id: 1, title: 'Note 1', user_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, title: 'Note 2', user_id: 1, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ];
      const mockResponse = { data: { data: mockNotes } };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await notesService.getAll();

      expect(mockAxios.get).toHaveBeenCalledWith('/notes');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getOne', () => {
    it('should fetch a single note', async () => {
      const mockNote = { id: 1, title: 'Note 1', user_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' };
      const mockResponse = { data: { data: mockNote } };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await notesService.getOne(1);

      expect(mockAxios.get).toHaveBeenCalledWith('/notes/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const newNote = { title: 'New Note' };
      const mockResponse = {
        data: {
          data: { id: 1, ...newNote, user_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await notesService.create(newNote);

      expect(mockAxios.post).toHaveBeenCalledWith('/notes', newNote);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('update', () => {
    it('should update a note', async () => {
      const updateData = { title: 'Updated Note' };
      const mockResponse = {
        data: {
          data: { id: 1, ...updateData, user_id: 1, created_at: '2024-01-01', updated_at: '2024-01-02' },
        },
      };

      mockAxios.patch.mockResolvedValue(mockResponse);

      const result = await notesService.update(1, updateData);

      expect(mockAxios.patch).toHaveBeenCalledWith('/notes/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should delete a note', async () => {
      mockAxios.delete.mockResolvedValue({});

      await notesService.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/notes/1');
    });
  });
});
