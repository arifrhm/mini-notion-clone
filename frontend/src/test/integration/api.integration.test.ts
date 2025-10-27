// @vitest-environment node
import axios from 'axios';
import { describe, it, expect, beforeAll } from 'vitest';
import { apiConfig, apiEndpoints } from '@shared/config/api.config';

// Increase timeout for API calls
const TIMEOUT = 30000;

function buildCookieHeader(setCookie: string[] | undefined) {
  const cookies = setCookie || [];
  const pairs = cookies.map((c) => c.split(';')[0]);
  return pairs.join('; ');
}

describe('API Integration (real backend)', () => {
  let email: string;
  const password = 'password123';
  const baseURL = apiConfig.baseURL;

  const api = axios.create({ baseURL, withCredentials: true });
  let authApi = api;

  beforeAll(async () => {
    // Register a fresh user and capture cookies
    email = `inttest+${Date.now()}@example.com`;
    const res = await api.post(apiEndpoints.auth.register, { email, password });
    expect(res.status).toBe(201);

    const cookieHeader = buildCookieHeader(res.headers['set-cookie'] as any);
    expect(cookieHeader).toContain('access_token=');
    expect(cookieHeader).toContain('refresh_token=');

    authApi = axios.create({ baseURL, headers: { Cookie: cookieHeader } });
  }, TIMEOUT);

  it('GET /auth/me returns the current user', async () => {
    const res = await authApi.get(apiEndpoints.auth.me);
    expect(res.status).toBe(200);
    expect(res.data?.data?.user?.email).toBe(email);
  }, TIMEOUT);

  it('Notes and Blocks CRUD + reorder works end-to-end', async () => {
    // Create note
    const noteTitle = 'Integration Note';
    const createNote = await authApi.post(apiEndpoints.notes.base, { title: noteTitle });
    expect(createNote.status).toBe(201);
    const noteId = createNote.data?.data?.id;
    expect(typeof noteId).toBe('number');

    // Create two blocks
    const b1 = await authApi.post(apiEndpoints.blocks.base(noteId), { type: 'text', content: 'Hello', order_index: 0 });
    expect(b1.status).toBe(201);
    const blockId1 = b1.data?.data?.id;

    const b2 = await authApi.post(apiEndpoints.blocks.base(noteId), { type: 'code', content: 'console.log("Hi")', order_index: 1 });
    expect(b2.status).toBe(201);
    const blockId2 = b2.data?.data?.id;

    // List blocks
    const list1 = await authApi.get(apiEndpoints.blocks.base(noteId));
    expect(list1.status).toBe(200);
    const blocks1 = list1.data?.data;
    const ids1 = blocks1.map((b: any) => b.id);
    expect(ids1).toEqual([blockId1, blockId2]);

    // Reorder blocks (swap)
    const reorder = await authApi.post(apiEndpoints.blocks.reorder(noteId), {
      blocks: [
        { id: blockId1, order_index: 1 },
        { id: blockId2, order_index: 0 },
      ],
    });
    expect(reorder.status).toBe(201);

    // Small delay to ensure DB update visibility
    await new Promise((r) => setTimeout(r, 200));

    // Verify order via list
    const list2 = await authApi.get(apiEndpoints.blocks.base(noteId));
    expect(list2.status).toBe(200);
    const blocks2 = list2.data?.data;
    const byId: Map<number, any> = new Map(blocks2.map((b: any) => [b.id, b]));
    expect(byId.get(blockId1)?.order_index).toBe(1);
    expect(byId.get(blockId2)?.order_index).toBe(0);

    // Delete one block
    const del = await authApi.delete(apiEndpoints.blocks.byId(noteId, blockId2));
    expect(del.status).toBe(200);

    const list3 = await authApi.get(apiEndpoints.blocks.base(noteId));
    expect(list3.status).toBe(200);
    const blocks3 = list3.data?.data;
    const ids = blocks3.map((b: any) => b.id);
    expect(ids).toContain(blockId1);
    expect(ids).not.toContain(blockId2);
  }, TIMEOUT);
});