import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getMe: () =>
    api.get('/auth/me'),
};

export const notesApi = {
  getAll: () =>
    api.get('/notes'),
  
  getOne: (id: number) =>
    api.get(`/notes/${id}`),
  
  create: (title: string) =>
    api.post('/notes', { title }),
  
  update: (id: number, title: string) =>
    api.patch(`/notes/${id}`, { title }),
  
  delete: (id: number) =>
    api.delete(`/notes/${id}`),
};

export const blocksApi = {
  getAll: (noteId: number) =>
    api.get(`/notes/${noteId}/blocks`),
  
  create: (noteId: number, data: any) =>
    api.post(`/notes/${noteId}/blocks`, data),
  
  update: (noteId: number, blockId: number, data: any) =>
    api.patch(`/notes/${noteId}/blocks/${blockId}`, data),
  
  delete: (noteId: number, blockId: number) =>
    api.delete(`/notes/${noteId}/blocks/${blockId}`),
  
  reorder: (noteId: number, blocks: { id: number; order_index: number }[]) =>
    api.post(`/notes/${noteId}/blocks/reorder`, { blocks }),
};

export default api;
