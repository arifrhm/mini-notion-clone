import { useState, useEffect, useCallback } from 'react';
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
import { notesApi, blocksApi } from '../services/api';
import { Note, Block, BlockType } from '../types';
import { SortableBlock } from '../components/SortableBlock';
import '../styles/editor.css';

interface NoteTitleFormData {
  title: string;
}

export const NoteEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue } = useForm<NoteTitleFormData>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      loadNote();
    }
  }, [id]);

  const loadNote = async () => {
    try {
      const response = await notesApi.getOne(Number(id));
      setNote(response.data);
      setBlocks(response.data.blocks || []);
      setValue('title', response.data.title);
    } catch (error) {
      console.error('Failed to load note', error);
      navigate('/notes');
    }
  };

  const updateTitle = async (data: NoteTitleFormData) => {
    if (!id) return;
    try {
      await notesApi.update(Number(id), data.title);
      setNote(prev => prev ? { ...prev, title: data.title } : null);
    } catch (error) {
      console.error('Failed to update title', error);
    }
  };

  const autosave = useCallback(async () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  }, []);

  const addBlock = async (type: BlockType) => {
    if (!id) return;
    
    const newBlock = {
      type,
      content: type === BlockType.CHECKLIST ? '[]' : '',
      order_index: blocks.length,
    };

    try {
      const response = await blocksApi.create(Number(id), newBlock);
      setBlocks([...blocks, response.data]);
      autosave();
    } catch (error) {
      console.error('Failed to create block', error);
    }
  };

  const updateBlock = async (blockId: number, content: string) => {
    if (!id) return;
    
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, content } : b));
    
    try {
      await blocksApi.update(Number(id), blockId, { content });
      autosave();
    } catch (error) {
      console.error('Failed to update block', error);
    }
  };

  const deleteBlock = async (blockId: number) => {
    if (!id) return;
    
    try {
      await blocksApi.delete(Number(id), blockId);
      setBlocks(blocks.filter(b => b.id !== blockId));
      autosave();
    } catch (error) {
      console.error('Failed to delete block', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order_index: index,
      }));

      setBlocks(newBlocks);

      try {
        await blocksApi.reorder(
          Number(id),
          newBlocks.map(b => ({ id: b.id, order_index: b.order_index }))
        );
        autosave();
      } catch (error) {
        console.error('Failed to reorder blocks', error);
        setBlocks(blocks);
      }
    }
  };

  if (!note) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="editor-container">
      <header className="editor-header">
        <button onClick={() => navigate('/notes')} className="btn-back">← Back</button>
        <div className="editor-status">
          {saving ? 'Saving...' : 'Saved'}
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
          <button onClick={() => addBlock(BlockType.TEXT)} className="btn-block">
            📝 Text
          </button>
          <button onClick={() => addBlock(BlockType.CHECKLIST)} className="btn-block">
            ✅ Checklist
          </button>
          <button onClick={() => addBlock(BlockType.IMAGE)} className="btn-block">
            🖼️ Image
          </button>
          <button onClick={() => addBlock(BlockType.CODE)} className="btn-block">
            💻 Code
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="blocks-container">
              {blocks.map(block => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={(content) => updateBlock(block.id, content)}
                  onDelete={() => deleteBlock(block.id)}
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
};
