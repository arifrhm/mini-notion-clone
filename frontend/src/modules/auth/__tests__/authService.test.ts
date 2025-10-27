import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { AuthService } from '../services/authService';

vi.mock('axios');

describe('AuthService', () => {
  let authService: AuthService;
  let mockAxios: any;

  beforeEach(() => {
    mockAxios = {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    vi.mocked(axios.create).mockReturnValue(mockAxios as any);
    authService = new AuthService('http://localhost:3001');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        data: {
          success: true,
          message: 'User registered successfully',
          data: {
            user: { id: 1, email: 'test@example.com' },
            accessToken: 'token123',
          },
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.register(credentials);

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle registration errors', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const error = new Error('Registration failed');

      mockAxios.post.mockRejectedValue(error);

      await expect(authService.register(credentials)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            user: { id: 1, email: 'test@example.com' },
            accessToken: 'token123',
          },
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const error = new Error('Invalid credentials');

      mockAxios.post.mockRejectedValue(error);

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockResponse = {
        data: { success: true, message: 'Logout successful' },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getMe', () => {
    it('should get current user successfully', async () => {
      const mockResponse = {
        data: {
          data: { id: 1, email: 'test@example.com' },
        },
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await authService.getMe();

      expect(mockAxios.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle unauthorized errors', async () => {
      const error = new Error('Unauthorized');

      mockAxios.get.mockRejectedValue(error);

      await expect(authService.getMe()).rejects.toThrow('Unauthorized');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { accessToken: 'newToken123' },
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('setAuthInterceptor', () => {
    it('should set auth interceptor correctly', () => {
      const onUnauthorized = vi.fn();

      authService.setAuthInterceptor(onUnauthorized);

      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });

    it('should call onUnauthorized on 401 error', async () => {
      const onUnauthorized = vi.fn();
      let errorHandler: any;

      mockAxios.interceptors.response.use.mockImplementation((success, error) => {
        errorHandler = error;
      });

      authService.setAuthInterceptor(onUnauthorized);

      const error = {
        response: { status: 401 },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(onUnauthorized).toHaveBeenCalled();
    });
  });
});
