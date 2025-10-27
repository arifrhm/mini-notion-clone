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

interface NoteTitleFormData {
  title: string;
}

export function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue } = useForm<NoteTitleFormData>();
  
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
