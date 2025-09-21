import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);
    const message = this.getMessage(exception);
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;
    const ip = request.ip || request.connection.remoteAddress;

    // Log the error
    const errorInfo = {
      statusCode: status,
      timestamp,
      path,
      method,
      ip,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error(`Internal server error: ${JSON.stringify(errorInfo)}`);
    } else if (status >= 400) {
      this.logger.warn(`Client error: ${JSON.stringify(errorInfo)}`);
    }

    // Response format
    const errorResponse = {
      statusCode: status,
      timestamp,
      path,
      method,
      message: this.sanitizeMessage(message, status),
      ...(process.env.NODE_ENV === 'development' && {
        error: exception instanceof Error ? exception.name : 'Unknown Error',
        details: exception instanceof Error ? exception.message : String(exception),
      }),
    };

    response.status(status).json(errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // Handle specific error types
    if (exception instanceof Error) {
      switch (exception.name) {
        case 'ValidationError':
          return HttpStatus.BAD_REQUEST;
        case 'UnauthorizedError':
          return HttpStatus.UNAUTHORIZED;
        case 'ForbiddenError':
          return HttpStatus.FORBIDDEN;
        case 'NotFoundError':
          return HttpStatus.NOT_FOUND;
        case 'ConflictError':
          return HttpStatus.CONFLICT;
        case 'TooManyRequestsError':
          return HttpStatus.TOO_MANY_REQUESTS;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string' ? response : (response as any).message || 'Unknown error';
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return String(exception);
  }

  private sanitizeMessage(message: string, status: number): string {
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && status >= 500) {
      return 'Internal server error. Please try again later.';
    }

    // Sanitize sensitive information
    return message
      .replace(/password/gi, '***')
      .replace(/token/gi, '***')
      .replace(/key/gi, '***');
  }
}