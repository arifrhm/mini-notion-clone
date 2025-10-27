import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        // If data already has standardized format, return as is
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        // Transform to standard format
        return {
          statusCode,
          message: this.getDefaultMessage(request.method, statusCode),
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getDefaultMessage(method: string, statusCode: number): string {
    if (statusCode === 201) return 'Resource created successfully';
    if (statusCode === 204) return 'Resource deleted successfully';
    
    switch (method) {
      case 'POST':
        return 'Created successfully';
      case 'PUT':
      case 'PATCH':
        return 'Updated successfully';
      case 'DELETE':
        return 'Deleted successfully';
      default:
        return 'Success';
    }
  }
}
