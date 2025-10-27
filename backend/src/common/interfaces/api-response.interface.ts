export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface SuccessResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T = any> {
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}
