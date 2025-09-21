import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestLog {
  timestamp: Date;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  statusCode?: number;
  responseTime?: number;
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';

    const requestLog: RequestLog = {
      timestamp: new Date(),
      method,
      url: originalUrl,
      ip,
      userAgent,
    };

    // Log incoming request
    this.logger.log(`${method} ${originalUrl} - ${ip}`);

    // Override res.end to capture response details
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any, cb?: any): any {
      const responseTime = Date.now() - start;
      requestLog.statusCode = res.statusCode;
      requestLog.responseTime = responseTime;

      // Log response
      const logLevel = res.statusCode >= 400 ? 'error' : 'log';
      const logger = new Logger('HTTP');
      logger[logLevel](
        `${method} ${originalUrl} ${res.statusCode} - ${responseTime}ms - ${ip}`
      );

      // Store in analytics if needed
      if (res.statusCode >= 400) {
        logger.warn(`Error response: ${JSON.stringify(requestLog)}`);
      }

      return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
  }
}