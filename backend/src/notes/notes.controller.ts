import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(user.id, createNoteDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.notesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notesService.findOne(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(+id, user.id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notesService.remove(+id, user.id);
  }
}
