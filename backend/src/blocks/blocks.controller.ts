import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notes/:noteId/blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(
    @Param('noteId') noteId: string,
    @CurrentUser() user: any,
    @Body() createBlockDto: CreateBlockDto
  ) {
    return this.blocksService.create(+noteId, user.id, createBlockDto);
  }

  @Post('reorder')
  reorder(
    @Param('noteId') noteId: string,
    @CurrentUser() user: any,
    @Body() reorderDto: ReorderBlocksDto
  ) {
    return this.blocksService.reorder(+noteId, user.id, reorderDto);
  }

  @Get()
  findAll(@Param('noteId') noteId: string, @CurrentUser() user: any) {
    return this.blocksService.findAll(+noteId, user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: any
  ) {
    return this.blocksService.findOne(+id, +noteId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: any,
    @Body() updateBlockDto: UpdateBlockDto
  ) {
    return this.blocksService.update(+id, +noteId, user.id, updateBlockDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: any
  ) {
    return this.blocksService.remove(+id, +noteId, user.id);
  }
}
