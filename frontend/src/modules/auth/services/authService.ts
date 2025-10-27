import axios, { AxiosInstance } from 'axios';
import { apiConfig, apiEndpoints } from '@shared/config/api.config';
import { LoginCredentials, RegisterCredentials, User } from '../types';

export class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      withCredentials: apiConfig.withCredentials,
      headers: apiConfig.headers,
    });
  }

  async register(credentials: RegisterCredentials) {
    const response = await this.api.post(apiEndpoints.auth.register, credentials);
    return response.data;
  }

  async login(credentials: LoginCredentials) {
    const response = await this.api.post(apiEndpoints.auth.login, credentials);
    return response.data;
  }

  async logout() {
    const response = await this.api.post(apiEndpoints.auth.logout);
    return response.data;
  }

  async getMe(): Promise<{ data: User }> {
    const response = await this.api.get(apiEndpoints.auth.me);
    return response.data;
  }

  async refreshToken() {
    const response = await this.api.post(apiEndpoints.auth.refresh);
    return response.data;
  }

  setAuthInterceptor(onUnauthorized: () => void) {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          onUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();
