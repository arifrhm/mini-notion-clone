// Blocks Module Exports
export { blocksService, BlocksService } from './services/blocksService';
export { useBlocks } from './hooks/useBlocks';

// Components
export { SortableBlock } from './components/SortableBlock';
export { TextBlock } from './components/TextBlock';
export { ChecklistBlock } from './components/ChecklistBlock';
export { ImageBlock } from './components/ImageBlock';
export { CodeBlock } from './components/CodeBlock';

export { BlockType } from './types';
export type {
  Block,
  CreateBlockDto,
  UpdateBlockDto,
  ReorderBlockDto,
} from './types';
