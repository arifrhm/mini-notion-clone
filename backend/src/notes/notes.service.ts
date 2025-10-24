import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async create(userId: number, createNoteDto: CreateNoteDto) {
    const note = this.noteRepository.create({
      ...createNoteDto,
      user_id: userId,
      last_edited_by: userId,
    });
    return this.noteRepository.save(note);
  }

  async findAll(userId: number) {
    return this.noteRepository.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: ['blocks'],
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    if (note.blocks) {
      note.blocks.sort((a, b) => a.order_index - b.order_index);
    }

    return note;
  }

  async update(id: number, userId: number, updateNoteDto: UpdateNoteDto) {
    const note = await this.findOne(id, userId);
    
    Object.assign(note, updateNoteDto);
    note.last_edited_by = userId;
    
    return this.noteRepository.save(note);
  }

  async remove(id: number, userId: number) {
    const note = await this.findOne(id, userId);
    await this.noteRepository.remove(note);
    return { message: 'Note deleted successfully' };
  }
}
