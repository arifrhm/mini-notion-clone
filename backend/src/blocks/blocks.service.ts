import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './block.entity';
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

  async create(noteId: number, userId: number, createBlockDto: CreateBlockDto) {
    await this.verifyNoteAccess(noteId, userId);

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

    const promises = reorderDto.blocks.map(({ id, order_index }) =>
      this.blockRepository.update(
        { id, note_id: noteId },
        { order_index }
      )
    );

    await Promise.all(promises);
    
    await this.noteRepository.update(noteId, { last_edited_by: userId });

    return { message: 'Blocks reordered successfully' };
  }
}
