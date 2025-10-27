// Auth Module Exports
export { AuthProvider, useAuth } from './hooks/useAuth';
export { authService, AuthService } from './services/authService';
export { ProtectedRoute } from './components/ProtectedRoute';
export { Login } from './pages/Login';
export { Register } from './pages/Register';

export type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AuthContextType,
} from './types';
