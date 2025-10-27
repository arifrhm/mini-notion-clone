import axios, { AxiosInstance } from 'axios';
import { apiConfig, apiEndpoints } from '@shared/config/api.config';
import { Block, CreateBlockDto, UpdateBlockDto, ReorderBlockDto } from '../types';

export class BlocksService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      withCredentials: apiConfig.withCredentials,
      headers: apiConfig.headers,
    });
  }

  async getAll(noteId: number): Promise<{ data: Block[] }> {
    const response = await this.api.get(apiEndpoints.blocks.base(noteId));
    return response.data;
  }

  async create(noteId: number, data: CreateBlockDto): Promise<{ data: Block }> {
    const response = await this.api.post(apiEndpoints.blocks.base(noteId), data);
    return response.data;
  }

  async update(noteId: number, blockId: number, data: UpdateBlockDto): Promise<{ data: Block }> {
    const response = await this.api.patch(apiEndpoints.blocks.byId(noteId, blockId), data);
    return response.data;
  }

  async delete(noteId: number, blockId: number): Promise<void> {
    await this.api.delete(apiEndpoints.blocks.byId(noteId, blockId));
  }

  async reorder(noteId: number, blocks: ReorderBlockDto[]): Promise<void> {
    await this.api.post(apiEndpoints.blocks.reorder(noteId), { blocks });
  }
}

export const blocksService = new BlocksService();
