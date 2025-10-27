import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CollabGateway } from './collab.gateway';
import { NotesModule } from '../notes/notes.module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [JwtModule.register({}), NotesModule, BlocksModule],
  providers: [CollabGateway],
})
export class CollabModule {}