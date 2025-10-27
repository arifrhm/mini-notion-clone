import axios, { AxiosInstance } from 'axios';
import { apiConfig, apiEndpoints } from '@shared/config/api.config';
import { Note, CreateNoteDto, UpdateNoteDto } from '../types';

export class NotesService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      withCredentials: apiConfig.withCredentials,
      headers: apiConfig.headers,
    });
  }

  async getAll(): Promise<{ data: Note[] }> {
    const response = await this.api.get(apiEndpoints.notes.base);
    return response.data;
  }

  async getOne(id: number): Promise<{ data: Note }> {
    const response = await this.api.get(apiEndpoints.notes.byId(id));
    return response.data;
  }

  async create(data: CreateNoteDto): Promise<{ data: Note }> {
    const response = await this.api.post(apiEndpoints.notes.base, data);
    return response.data;
  }

  async update(id: number, data: UpdateNoteDto): Promise<{ data: Note }> {
    const response = await this.api.patch(apiEndpoints.notes.byId(id), data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await this.api.delete(apiEndpoints.notes.byId(id));
  }
}

export const notesService = new NotesService();
