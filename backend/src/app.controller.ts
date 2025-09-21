import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'API is running successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        version: { type: 'string' }
      }
    }
  })
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health status check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        environment: { type: 'string' }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('version')
  @ApiOperation({ summary: 'Get API version' })
  @ApiResponse({ 
    status: 200, 
    description: 'API version information',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string' },
        environment: { type: 'string' },
        timestamp: { type: 'string' }
      }
    }
  })
  getVersion() {
    return this.appService.getVersion();
  }
}