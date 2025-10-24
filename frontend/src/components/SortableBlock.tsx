import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block, BlockType } from '../types';
import { TextBlock } from './TextBlock';
import { ChecklistBlock } from './ChecklistBlock';
import { ImageBlock } from './ImageBlock';
import { CodeBlock } from './CodeBlock';

interface SortableBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

export const SortableBlock = ({ block, onUpdate, onDelete }: SortableBlockProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case BlockType.TEXT:
        return <TextBlock content={block.content} onChange={onUpdate} />;
      case BlockType.CHECKLIST:
        return <ChecklistBlock content={block.content} onChange={onUpdate} />;
      case BlockType.IMAGE:
        return <ImageBlock content={block.content} onChange={onUpdate} />;
      case BlockType.CODE:
        return <CodeBlock content={block.content} onChange={onUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-block">
      <div className="block-controls">
        <button className="drag-handle" {...attributes} {...listeners}>
          ⋮⋮
        </button>
        <button className="btn-delete" onClick={onDelete}>
          🗑️
        </button>
      </div>
      <div className="block-content">
        {renderBlockContent()}
      </div>
    </div>
  );
};
