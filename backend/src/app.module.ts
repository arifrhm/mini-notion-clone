import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { BlocksModule } from './blocks/blocks.module';
import { User } from './users/user.entity';
import { Note } from './notes/note.entity';
import { Block } from './blocks/block.entity';
import { ENV_CONFIG, DEFAULT_VALUES } from './config/env.config';
import { CollabModule } from './collab/collab.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get(ENV_CONFIG.DB_HOST, DEFAULT_VALUES.DB_HOST),
        port: configService.get(ENV_CONFIG.DB_PORT, DEFAULT_VALUES.DB_PORT),
        username: configService.get(ENV_CONFIG.DB_USERNAME, DEFAULT_VALUES.DB_USERNAME),
        password: configService.get(ENV_CONFIG.DB_PASSWORD, DEFAULT_VALUES.DB_PASSWORD),
        database: configService.get(ENV_CONFIG.DB_NAME, DEFAULT_VALUES.DB_NAME),
        entities: [User, Note, Block],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    NotesModule,
    BlocksModule,
    CollabModule,
  ],
})
export class AppModule {}
