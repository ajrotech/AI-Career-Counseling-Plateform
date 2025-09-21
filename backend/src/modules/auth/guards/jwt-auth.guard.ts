import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      // For development, allow access without token
      if (process.env.NODE_ENV === 'development') {
        request.user = this.createDemoUser();
        return true;
      }
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // Create a user object from the JWT payload
      request.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username || payload.email,
        role: payload.role || 'student',
        isActive: true,
      };
      
      return true;
    } catch (error) {
      // For development, fallback to demo user
      if (process.env.NODE_ENV === 'development') {
        request.user = this.createDemoUser();
        return true;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private createDemoUser(): any {
    return {
      id: 'demo-user-id',
      email: 'demo@example.com',
      username: 'demo_user',
      role: 'student',
      emailVerified: true,
      isActive: true,
    };
  }
}