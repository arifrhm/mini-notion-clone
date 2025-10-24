import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { Block } from './block.entity';
import { Note } from '../notes/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block, Note])],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
