import { SuccessResponse, PaginatedResponse } from '../interfaces/api-response.interface';

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): SuccessResponse<T> {
    return {
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(
    data: T,
    message: string = 'Resource created successfully',
  ): SuccessResponse<T> {
    return this.success(data, message, 201);
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
  ): PaginatedResponse<T> {
    return {
      statusCode: 200,
      message,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
