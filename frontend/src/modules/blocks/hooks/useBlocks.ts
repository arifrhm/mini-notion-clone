import { useState, useCallback } from 'react';
import { blocksService } from '../services/blocksService';
import { Block, BlockType, CreateBlockDto, ReorderBlockDto } from '../types';

export function useBlocks(noteId: number) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blocksService.getAll(noteId);
      setBlocks(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blocks');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  const createBlock = useCallback(async (type: BlockType, content: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const newBlock: CreateBlockDto = {
        type,
        content: type === BlockType.CHECKLIST ? '[]' : content,
        order_index: blocks.length,
      };

      const response = await blocksService.create(noteId, newBlock);
      setBlocks(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create block');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [noteId, blocks.length]);

  const updateBlock = useCallback(async (blockId: number, content: string) => {
    try {
      setError(null);
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
      
      await blocksService.update(noteId, blockId, { content });
    } catch (err: any) {
      setError(err.message || 'Failed to update block');
      throw err;
    }
  }, [noteId]);

  const deleteBlock = useCallback(async (blockId: number) => {
    try {
      setLoading(true);
      setError(null);
      await blocksService.delete(noteId, blockId);
      setBlocks(prev => prev.filter(b => b.id !== blockId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete block');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  const reorderBlocks = useCallback(async (reorderedBlocks: Block[]) => {
    try {
      setError(null);
      setBlocks(reorderedBlocks);
      
      const reorderData: ReorderBlockDto[] = reorderedBlocks.map(b => ({
        id: b.id,
        order_index: b.order_index,
      }));

      await blocksService.reorder(noteId, reorderData);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder blocks');
      throw err;
    }
  }, [noteId]);

  return {
    blocks,
    setBlocks,
    loading,
    error,
    fetchBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  };
}
