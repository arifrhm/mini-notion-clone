/**
 * Centralized API Configuration
 * 
 * All API-related configuration should be defined here.
 * Services should import and use these configurations instead of hardcoding values.
 */

export const apiConfig = {
  /**
   * Base URL for API requests
   * Falls back to localhost if environment variable is not set
   */
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',

  /**
   * API timeout in milliseconds
   */
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  /**
   * Whether to include credentials (cookies) in requests
   */
  withCredentials: true,

  /**
   * Default headers for all requests
   */
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * API endpoints configuration
 */
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  notes: {
    base: '/notes',
    byId: (id: number) => `/notes/${id}`,
  },
  blocks: {
    base: (noteId: number) => `/notes/${noteId}/blocks`,
    byId: (noteId: number, blockId: number) => `/notes/${noteId}/blocks/${blockId}`,
    reorder: (noteId: number) => `/notes/${noteId}/blocks/reorder`,
  },
} as const;

/**
 * Environment configuration
 */
export const envConfig = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiBaseURL: import.meta.env.VITE_API_BASE_URL,
  mode: import.meta.env.MODE,
} as const;
