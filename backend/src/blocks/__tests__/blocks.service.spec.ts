import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlocksService } from '../blocks.service';
import { Block, BlockType } from '../block.entity';
import { Note } from '../../notes/note.entity';

class MockRepository<T extends object> {
  data: T[];
  manager = { transaction: async (fn: any) => fn({ update: async () => {} }) };
  constructor(initial: T[] = []) { this.data = initial; }
  create(obj: Partial<T>): T { return obj as T; }
  async save(obj: T): Promise<T> { const idx = this.data.indexOf(obj); if (idx === -1) this.data.push(obj); return obj; }
  async find(opts: any): Promise<T[]> { const where = opts?.where || {}; return this.data.filter((item: any) => Object.keys(where).every((k) => item[k] === where[k])); }
  async findOne(opts: any): Promise<T | null> { const where = opts?.where || {}; return (this.data.find((item: any) => Object.keys(where).every((k) => item[k] === where[k])) || null); }
  async remove(obj: T): Promise<void> { this.data = this.data.filter((x) => x !== obj); }
  async update(_: any, __: any): Promise<void> { /* no-op */ }
}

describe('BlocksService', () => {
  let service: BlocksService;
  let blockRepo: MockRepository<Block>;
  let noteRepo: MockRepository<Note>;

  beforeEach(() => {
    noteRepo = new MockRepository<Note>([{ id: 1, user_id: 123 } as any]);
    blockRepo = new MockRepository<Block>([
      { id: 10, note_id: 1, parent_id: null as any, type: BlockType.IMAGE, content: '', order_index: 0, created_at: new Date(), updated_at: new Date(), note: undefined as any },
    ]);
    service = new BlocksService(blockRepo as any, noteRepo as any);
  });

  it('verifyNoteAccess throws NotFound for missing note', async () => {
    noteRepo.data = [];
    await expect((service as any).verifyNoteAccess(99, 123)).rejects.toThrow(NotFoundException);
  });

  it('verifyNoteAccess throws Forbidden if user mismatch', async () => {
    noteRepo.data = [{ id: 1, user_id: 999 } as any];
    await expect((service as any).verifyNoteAccess(1, 123)).rejects.toThrow(ForbiddenException);
  });

  it('create rejects invalid image URL', async () => {
    await expect(service.create(1, 123, { type: BlockType.IMAGE, content: 'asasasdadasd', order_index: 0 })).rejects.toThrow(BadRequestException);
  });

  it('create allows empty image content', async () => {
    const res = await service.create(1, 123, { type: BlockType.IMAGE, content: '', order_index: 0 });
    expect(res).toBeTruthy();
  });

  it('update rejects invalid image URL', async () => {
    await expect(service.update(10, 1, 123, { content: 'not-a-url' })).rejects.toThrow(BadRequestException);
  });

  it('update accepts valid http image URL', async () => {
    const res = await service.update(10, 1, 123, { content: 'https://example.com/img.jpg' });
    expect(res).toBeTruthy();
  });

  it('update throws Conflict if expected_updated_at mismatch', async () => {
    const existing = blockRepo.data[0];
    const wrongTime = new Date(existing.updated_at.getTime() - 1000).toISOString();
    await expect(service.update(10, 1, 123, { expected_updated_at: wrongTime })).rejects.toThrow(ConflictException);
  });

  it('findAll returns blocks for note ordered', async () => {
    blockRepo.data.push({ id: 11, note_id: 1, parent_id: null as any, type: BlockType.TEXT, content: 'a', order_index: 2, created_at: new Date(), updated_at: new Date(), note: undefined as any });
    blockRepo.data.push({ id: 12, note_id: 1, parent_id: null as any, type: BlockType.TEXT, content: 'b', order_index: 1, created_at: new Date(), updated_at: new Date(), note: undefined as any });
    const res = await service.findAll(1, 123);
    expect(res.length).toBeGreaterThan(0);
  });

  it('findOne throws NotFound when block missing', async () => {
    await expect(service.findOne(999, 1, 123)).rejects.toThrow(NotFoundException);
  });

  it('remove deletes block and returns message', async () => {
    const res = await service.remove(10, 1, 123);
    expect(res).toEqual({ message: 'Block deleted successfully' });
  });

  // Fuzzy test for image URL validity
  it('fuzzy image URL validation', async () => {
    const valid = [
      'https://domain.com/a.png',
      'http://domain.com/a.jpg',
      '/images/x.svg',
      './img/y.gif',
      '../assets/z.webp',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg',
      'blob:https://domain.com/uuid-1234',
    ];
    const invalid = ['plain', 'http:/bad', 'data:;base64,', 'ftp://x', '://missing'];

    for (const u of valid) {
      const res = await service.update(10, 1, 123, { content: u });
      expect(res).toBeTruthy();
    }

    for (const u of invalid) {
      await expect(service.update(10, 1, 123, { content: u })).rejects.toThrow(BadRequestException);
    }
  });
});