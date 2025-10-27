import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block, BlockType } from './block.entity';
import { Note } from '../notes/note.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  private async verifyNoteAccess(noteId: number, userId: number) {
    const note = await this.noteRepository.findOne({ where: { id: noteId } });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    if (note.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this note');
    }
    return note;
  }

  private isValidImageUrl(u: string) {
    const s = (u || '').trim();
    if (!s) return false;
    if (/^https?:\/\/.+/i.test(s)) return true; // http(s)
    if (/^\/.+/.test(s)) return true; // root-relative
    if (/^\.{1,2}\/./.test(s)) return true; // relative ./ ../
    if (/^data:image\/[a-zA-Z]+;base64,/.test(s)) return true; // data url
    if (/^blob:/.test(s)) return true; // blob url
    return false;
  }

  async create(noteId: number, userId: number, createBlockDto: CreateBlockDto) {
    await this.verifyNoteAccess(noteId, userId);

    // Validate image URL if provided and type is IMAGE (allow empty for initial state)
    if (createBlockDto.type === BlockType.IMAGE && createBlockDto.content) {
      if (!this.isValidImageUrl(createBlockDto.content)) {
        throw new BadRequestException('Invalid image URL');
      }
    }

    const block = this.blockRepository.create({
      ...createBlockDto,
      note_id: noteId,
    });

    const savedBlock = await this.blockRepository.save(block);
    
    await this.noteRepository.update(noteId, { last_edited_by: userId });

    return savedBlock;
  }

  async findAll(noteId: number, userId: number) {
    await this.verifyNoteAccess(noteId, userId);

    return this.blockRepository.find({
      where: { note_id: noteId },
      order: { order_index: 'ASC' },
    });
  }

  async findOne(id: number, noteId: number, userId: number) {
    await this.verifyNoteAccess(noteId, userId);

    const block = await this.blockRepository.findOne({
      where: { id, note_id: noteId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }

  async update(id: number, noteId: number, userId: number, updateBlockDto: UpdateBlockDto) {
    const block = await this.findOne(id, noteId, userId);

    if (updateBlockDto.expected_updated_at) {
      const expected = new Date(updateBlockDto.expected_updated_at).getTime();
      const actual = new Date(block.updated_at).getTime();
      if (expected !== actual) {
        throw new ConflictException('Block has been modified by another user');
      }
      delete (updateBlockDto as any).expected_updated_at;
    }

    // Determine resulting type (may be unchanged or overridden by DTO)
    const resultingType = updateBlockDto.type ?? block.type;
    // Validate image URL if updating content and resulting type is IMAGE
    if (resultingType === BlockType.IMAGE && updateBlockDto.content !== undefined) {
      const content = (updateBlockDto.content || '').trim();
      // Allow empty to let frontend stay in edit mode, but reject invalid non-empty strings
      if (content && !this.isValidImageUrl(content)) {
        throw new BadRequestException('Invalid image URL');
      }
    }

    Object.assign(block, updateBlockDto);
    const updated = await this.blockRepository.save(block);

    await this.noteRepository.update(noteId, { last_edited_by: userId });

    return updated;
  }

  async remove(id: number, noteId: number, userId: number) {
    const block = await this.findOne(id, noteId, userId);
    await this.blockRepository.remove(block);
    
    await this.noteRepository.update(noteId, { last_edited_by: userId });

    return { message: 'Block deleted successfully' };
  }

  async reorder(noteId: number, userId: number, reorderDto: ReorderBlocksDto) {
    await this.verifyNoteAccess(noteId, userId);

    await this.blockRepository.manager.transaction(async (manager) => {
      for (const { id, order_index } of reorderDto.blocks) {
        // Update only blocks belonging to the note; skip if not found
        await manager.update(Block, { id, note_id: noteId }, { order_index });
      }
      await manager.update(Note, noteId, { last_edited_by: userId });
    });

    return { message: 'Blocks reordered successfully' };
  }
}
