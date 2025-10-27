import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { BlocksService } from '../src/blocks/blocks.service';
import { BlockType, Block } from '../src/blocks/block.entity';

// Minimal mock Repository implementation
class MockRepository<T extends object> {
  private data: T[] = [];
  manager = { transaction: async (fn: any) => fn({ update: async () => {} }) };

  constructor(initial: T[] = []) {
    this.data = initial;
  }

  create(obj: Partial<T>): T {
    return obj as T;
  }

  async save(obj: T): Promise<T> {
    const idx = this.data.indexOf(obj);
    if (idx === -1) this.data.push(obj);
    return obj;
  }

  async findOne(opts: any): Promise<T | null> {
    if (typeof opts === 'object' && 'where' in opts) {
      const where = (opts as any).where;
      return (
        this.data.find((item: any) => {
          return Object.keys(where).every((k) => item[k] === where[k]);
        }) || null
      );
    }
    return (this.data[0] as T) || null;
  }

  async remove(obj: T): Promise<void> {
    this.data = this.data.filter((x) => x !== obj);
  }

  async update(_: any, __: any): Promise<void> {
    // no-op for tests
  }
}

async function run() {
  const noteRepo = new MockRepository<any>([{ id: 1, user_id: 123 }]);
  const existingBlock: Block = {
    id: 10,
    note_id: 1,
    note: undefined as any,
    parent_id: null as any,
    type: BlockType.IMAGE,
    content: '',
    order_index: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const blockRepo = new MockRepository<Block>([existingBlock]);

  const service = new BlocksService(blockRepo as any, noteRepo as any);

  let passed = 0;
  let failed = 0;
  const assertPass = (cond: boolean, name: string) => {
    if (cond) { console.log(`PASS: ${name}`); passed++; } else { console.error(`FAIL: ${name}`); failed++; }
  };

  // Test create: invalid non-empty string should reject
  try {
    await service.create(1, 123, { type: BlockType.IMAGE, content: 'asasasdadasd', order_index: 0 });
    assertPass(false, 'create rejects invalid image URL');
  } catch (e) {
    assertPass(e instanceof BadRequestException, 'create rejects invalid image URL');
  }

  // Test create: empty content allowed
  try {
    const res = await service.create(1, 123, { type: BlockType.IMAGE, content: '', order_index: 0 });
    assertPass(!!res, 'create allows empty content for image');
  } catch (e) {
    assertPass(false, 'create allows empty content for image');
  }

  // Test update: invalid non-empty string should reject
  try {
    await service.update(10, 1, 123, { content: 'not-a-url' });
    assertPass(false, 'update rejects invalid image URL');
  } catch (e) {
    assertPass(e instanceof BadRequestException, 'update rejects invalid image URL');
  }

  // Test update: valid http URL should pass
  try {
    const res = await service.update(10, 1, 123, { content: 'https://example.com/img.jpg' });
    assertPass(!!res, 'update accepts valid http image URL');
  } catch (e) {
    assertPass(false, 'update accepts valid http image URL');
  }

  // Summary
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});