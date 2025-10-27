import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { BlocksService } from '../services/blocksService';
import { BlockType } from '../types';

vi.mock('axios');

describe('BlocksService', () => {
  let blocksService: BlocksService;
  let mockAxios: any;

  beforeEach(() => {
    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    vi.mocked(axios.create).mockReturnValue(mockAxios as any);
    blocksService = new BlocksService();
  });

  describe('getAll', () => {
    it('should fetch all blocks for a note', async () => {
      const mockBlocks = [
        { id: 1, note_id: 1, type: BlockType.TEXT, content: 'Block 1', order_index: 0 },
        { id: 2, note_id: 1, type: BlockType.TEXT, content: 'Block 2', order_index: 1 },
      ];
      const mockResponse = { data: { data: mockBlocks } };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await blocksService.getAll(1);

      expect(mockAxios.get).toHaveBeenCalledWith('/notes/1/blocks');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('create', () => {
    it('should create a new block', async () => {
      const newBlock = { type: BlockType.TEXT, content: 'New Block', order_index: 0 };
      const mockResponse = {
        data: { data: { id: 1, note_id: 1, ...newBlock } },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await blocksService.create(1, newBlock);

      expect(mockAxios.post).toHaveBeenCalledWith('/notes/1/blocks', newBlock);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('update', () => {
    it('should update a block', async () => {
      const updateData = { content: 'Updated content' };
      const mockResponse = {
        data: {
          data: { id: 1, note_id: 1, type: BlockType.TEXT, ...updateData, order_index: 0 },
        },
      };

      mockAxios.patch.mockResolvedValue(mockResponse);

      const result = await blocksService.update(1, 1, updateData);

      expect(mockAxios.patch).toHaveBeenCalledWith('/notes/1/blocks/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should delete a block', async () => {
      mockAxios.delete.mockResolvedValue({});

      await blocksService.delete(1, 1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/notes/1/blocks/1');
    });
  });

  describe('reorder', () => {
    it('should reorder blocks', async () => {
      const reorderData = [
        { id: 1, order_index: 1 },
        { id: 2, order_index: 0 },
      ];

      mockAxios.post.mockResolvedValue({});

      await blocksService.reorder(1, reorderData);

      expect(mockAxios.post).toHaveBeenCalledWith('/notes/1/blocks/reorder', { blocks: reorderData });
    });
  });
});
