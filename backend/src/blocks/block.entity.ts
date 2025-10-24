import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Note } from '../notes/note.entity';

export enum BlockType {
  TEXT = 'text',
  CHECKLIST = 'checklist',
  IMAGE = 'image',
  CODE = 'code'
}

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  note_id: number;

  @ManyToOne(() => Note, note => note.blocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'note_id' })
  note: Note;

  @Column({ nullable: true })
  parent_id: number;

  @Column({
    type: 'enum',
    enum: BlockType
  })
  type: BlockType;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  order_index: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
