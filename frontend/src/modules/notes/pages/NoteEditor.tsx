import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { notesService } from '../services/notesService';
import { useBlocks, BlockType, Block } from '@modules/blocks';
import { SortableBlock } from '@modules/blocks/components/SortableBlock';
import { getSocket } from '@modules/collab/socket';
import { useAuth } from '@modules/auth';

interface NoteTitleFormData {
  title: string;
}

export function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue } = useForm<NoteTitleFormData>();
  const [presence, setPresence] = useState<number[]>([]);
  
  const noteId = Number(id);
  const { blocks, setBlocks, loading, createBlock, updateBlock, deleteBlock, reorderBlocks, fetchBlocks } = useBlocks(noteId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (noteId) {
      loadNote();
      fetchBlocks();
    }
  }, [noteId, fetchBlocks]);

  const loadNote = async () => {
    try {
      const response = await notesService.getOne(noteId);
      const noteData = response.data;
      setNoteTitle(noteData.title);
      setValue('title', noteData.title);
    } catch (error) {
      console.error('Failed to load note', error);
      navigate('/notes');
    }
  };

  const updateTitle = async (data: NoteTitleFormData) => {
    if (!noteId) return;
    try {
      setSaving(true);
      await notesService.update(noteId, { title: data.title });
      setNoteTitle(data.title);
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Failed to update title', error);
      setSaving(false);
    }
  };

  const handleAddBlock = async (type: BlockType) => {
    try {
      await createBlock(type);
    } catch (error) {
      console.error('Failed to create block', error);
    }
  };

  const handleUpdateBlock = async (blockId: number, content: string) => {
    try {
      setSaving(true);
      await updateBlock(blockId, content);
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Failed to update block', error);
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    try {
      await deleteBlock(blockId);
    } catch (error) {
      console.error('Failed to delete block', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b: Block) => b.id === active.id);
      const newIndex = blocks.findIndex((b: Block) => b.id === over.id);
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block: Block, index: number) => ({
        ...block,
        order_index: index,
      }));

      try {
        await reorderBlocks(newBlocks);
      } catch (error) {
        console.error('Failed to reorder blocks', error);
      }
    }
  };

  useEffect(() => {
    if (!noteId) return;
    const s = getSocket();
    s.emit('note:join', { noteId });

    const onPresence = (users: number[]) => setPresence(users);
    const onBlockCreated = (block: Block) => {
      setBlocks(prev => {
        if (prev.find(b => b.id === block.id)) return prev;
        return [...prev, block].sort((a, b) => a.order_index - b.order_index);
      });
    };
    const onBlockUpdated = (block: Block) => {
      setBlocks(prev => prev.map(b => (b.id === block.id ? block : b)));
    };
    const onBlockDeleted = ({ id }: { id: number }) => {
      setBlocks(prev => prev.filter(b => b.id !== id));
    };
    const onBlocksReordered = (order: Array<{ id: number; order_index: number }>) => {
      setBlocks(prev => prev.map(b => {
        const found = order.find(o => o.id === b.id);
        return found ? { ...b, order_index: found.order_index } : b;
      }).sort((a, b) => a.order_index - b.order_index));
    };

    s.on('presence', onPresence);
    s.on('block:created', onBlockCreated);
    s.on('block:updated', onBlockUpdated);
    s.on('block:deleted', onBlockDeleted);
    s.on('blocks:reordered', onBlocksReordered);

    return () => {
      s.off('presence', onPresence);
      s.off('block:created', onBlockCreated);
      s.off('block:updated', onBlockUpdated);
      s.off('block:deleted', onBlockDeleted);
      s.off('blocks:reordered', onBlocksReordered);
    };
  }, [noteId, setBlocks]);

  if (loading && blocks.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="editor-container">
      <header className="editor-header">
        <button onClick={() => navigate('/notes')} className="btn-back">← Back</button>
        <div className="editor-status">
          {saving ? 'Saving...' : 'Saved'}
        </div>
        <div className="editor-presence" title={`Online users: ${presence.length}`}>
          👥 {presence.length}
        </div>
      </header>

      <div className="editor-content">
        <form onBlur={handleSubmit(updateTitle)}>
          <input
            type="text"
            className="note-title-input"
            placeholder="Untitled"
            {...register('title')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(updateTitle)();
              }
            }}
          />
        </form>

        <div className="block-menu">
          <button onClick={() => handleAddBlock(BlockType.TEXT)} className="btn-block">
            📝 Text
          </button>
          <button onClick={() => handleAddBlock(BlockType.CHECKLIST)} className="btn-block">
            ✅ Checklist
          </button>
          <button onClick={() => handleAddBlock(BlockType.IMAGE)} className="btn-block">
            🖼️ Image
          </button>
          <button onClick={() => handleAddBlock(BlockType.CODE)} className="btn-block">
            💻 Code
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b: Block) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="blocks-container">
              {blocks.map((block: Block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={(content) => handleUpdateBlock(block.id, content)}
                  onDelete={() => handleDeleteBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <div className="empty-blocks">
            <p>No blocks yet. Add a block to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
