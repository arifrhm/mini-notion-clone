import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { BlocksModule } from './blocks/blocks.module';
import { User } from './users/user.entity';
import { Note } from './notes/note.entity';
import { Block } from './blocks/block.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, Note, Block],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    NotesModule,
    BlocksModule,
  ],
})
export class AppModule {}
