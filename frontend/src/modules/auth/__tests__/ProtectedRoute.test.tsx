import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../hooks/useAuth';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    getMe: vi.fn(),
    setAuthInterceptor: vi.fn(),
  },
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should show loading state initially', () => {
    vi.mocked(authService.getMe).mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<div />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    vi.mocked(authService.getMe).mockResolvedValue({ data: mockUser });

    renderWithRouter(<div />);

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', async () => {
    vi.mocked(authService.getMe).mockRejectedValue(new Error('Unauthorized'));

    renderWithRouter(<div />);

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });
});
