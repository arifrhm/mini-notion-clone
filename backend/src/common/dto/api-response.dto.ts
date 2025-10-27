import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = any> {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Success', description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: '2025-10-24T12:00:00.000Z', description: 'Timestamp' })
  timestamp: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed', description: 'Error message' })
  message: string;

  @ApiProperty({ example: 'Bad Request', description: 'Error type' })
  error: string;

  @ApiProperty({ example: '2025-10-24T12:00:00.000Z', description: 'Timestamp' })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login', description: 'Request path' })
  path: string;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Success', description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Array of data items', isArray: true })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty({ example: '2025-10-24T12:00:00.000Z', description: 'Timestamp' })
  timestamp: string;
}
