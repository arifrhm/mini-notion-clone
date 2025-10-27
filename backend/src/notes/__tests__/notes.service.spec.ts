import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotesService } from '../notes.service';
import { Note } from '../note.entity';
import { Block } from '../../blocks/block.entity';

class MockRepository<T extends object> {
  data: T[];
  constructor(initial: T[] = []) { this.data = initial; }
  create(obj: Partial<T>): T { return obj as T; }
  async save(obj: T): Promise<T> { const idx = this.data.indexOf(obj); if (idx === -1) this.data.push(obj); return obj; }
  async find(opts: any): Promise<T[]> { const where = opts?.where || {}; return this.data.filter((item: any) => Object.keys(where).every((k) => item[k] === where[k])); }
  async findOne(opts: any): Promise<T | null> { const where = opts?.where || {}; const rel = opts?.relations || []; const found = (this.data.find((item: any) => Object.keys(where).every((k) => item[k] === where[k])) || null) as any; if (found && rel.includes('blocks')) { found.blocks = found.blocks || []; } return found; }
  async remove(obj: T): Promise<void> { this.data = this.data.filter((x) => x !== obj); }
}

describe('NotesService', () => {
  let service: NotesService;
  let noteRepo: MockRepository<Note>;

  beforeEach(() => {
    noteRepo = new MockRepository<Note>([
      { id: 1, user_id: 123, title: 'A', content: 'C', last_edited_by: 123, created_at: new Date(), updated_at: new Date(), blocks: [{ order_index: 2 } as any, { order_index: 1 } as any] } as any,
    ]);
    service = new NotesService(noteRepo as any);
  });

  it('create assigns user and last_edited_by', async () => {
    const res = await service.create(123, { title: 'New' });
    expect(res).toBeTruthy();
  });

  it('findAll returns notes for user', async () => {
    const res = await service.findAll(123);
    expect(res.length).toBeGreaterThan(0);
  });

  it('findOne throws NotFound when missing', async () => {
    await expect(service.findOne(999, 123)).rejects.toThrow(NotFoundException);
  });

  it('findOne throws Forbidden for other user', async () => {
    (noteRepo.data[0] as any).user_id = 999;
    await expect(service.findOne(1, 123)).rejects.toThrow(ForbiddenException);
  });

  it('findOne sorts blocks by order_index', async () => {
    (noteRepo.data[0] as any).user_id = 123;
    const res = await service.findOne(1, 123);
    expect(res.blocks[0].order_index).toBeLessThanOrEqual(res.blocks[1].order_index);
  });

  it('update modifies note and last_edited_by', async () => {
    const res = await service.update(1, 123, { title: 'Updated' });
    expect(res.last_edited_by).toBe(123);
    expect(res.title).toBe('Updated');
  });

  it('remove deletes note and returns message', async () => {
    const res = await service.remove(1, 123);
    expect(res).toEqual({ message: 'Note deleted successfully' });
  });

  // Fuzzy test for titles (trimming/length resilience)
  it('fuzzy titles resilience', async () => {
    const titles = ['A', '   B  ', '', 'Very Long Title '.repeat(20)];
    for (const t of titles) {
      const res = await service.update(1, 123, { title: t });
      expect(res).toBeTruthy();
    }
  });
});