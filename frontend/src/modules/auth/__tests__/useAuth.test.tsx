import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    setAuthInterceptor: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      vi.mocked(authService.getMe).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user on mount if authenticated', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      vi.mocked(authService.getMe).mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle failed authentication on mount', async () => {
      vi.mocked(authService.getMe).mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      vi.mocked(authService.login).mockResolvedValue({});
      vi.mocked(authService.getMe).mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.current.user).toEqual(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith('/notes');
    });

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(authService.login).mockRejectedValue(error);
      vi.mocked(authService.getMe).mockResolvedValue({ data: null as any });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrong');
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      vi.mocked(authService.register).mockResolvedValue({});
      vi.mocked(authService.getMe).mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.register('test@example.com', 'password123');
      });

      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.current.user).toEqual(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith('/notes');
    });

    it('should handle registration errors', async () => {
      const error = new Error('Email already exists');
      vi.mocked(authService.register).mockRejectedValue(error);
      vi.mocked(authService.getMe).mockResolvedValue({ data: null as any });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.register('test@example.com', 'password123');
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      vi.mocked(authService.getMe).mockResolvedValue({ data: mockUser });
      vi.mocked(authService.logout).mockResolvedValue({});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should handle logout errors gracefully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      vi.mocked(authService.getMe).mockResolvedValue({ data: mockUser });
      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('error handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
