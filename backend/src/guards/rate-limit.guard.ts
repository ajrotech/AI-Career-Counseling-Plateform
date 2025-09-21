import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly store: RateLimitStore = {};
  private readonly windowMs: number = 60 * 1000; // 1 minute
  private readonly maxRequests: number = 100; // requests per window

  constructor(windowMs?: number, maxRequests?: number) {
    if (windowMs) this.windowMs = windowMs;
    if (maxRequests) this.maxRequests = maxRequests;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request);

    return this.isAllowed(key, request);
  }

  private generateKey(request: Request): string {
    // Use IP address as the primary identifier
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    
    // Add user ID if authenticated for more granular limits
    const userId = (request as any).user?.id;
    
    return userId ? `${ip}:${userId}` : ip;
  }

  private isAllowed(key: string, request: Request): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up old entries
    this.cleanup(windowStart);

    // Get or create entry for this key
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    const entry = this.store[key];

    // Reset if window has passed
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${key}: ${entry.count} requests`);
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    entry.count++;

    // Log suspicious activity (high request rates)
    if (entry.count > this.maxRequests * 0.8) {
      this.logger.warn(`High request rate detected for ${key}: ${entry.count}/${this.maxRequests}`);
    }

    return true;
  }

  private cleanup(windowStart: number): void {
    for (const key in this.store) {
      if (this.store[key].resetTime < windowStart) {
        delete this.store[key];
      }
    }
  }

  // Static factory methods for common configurations
  static forApi(): RateLimitGuard {
    return new RateLimitGuard(60 * 1000, 100); // 100 requests per minute
  }

  static forAuth(): RateLimitGuard {
    return new RateLimitGuard(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth
  }

  static forChat(): RateLimitGuard {
    return new RateLimitGuard(60 * 1000, 30); // 30 messages per minute
  }

  static forUpload(): RateLimitGuard {
    return new RateLimitGuard(60 * 1000, 10); // 10 uploads per minute
  }
}