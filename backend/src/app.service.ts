import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheck() {
    return {
      message: 'Career Counseling Platform API is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'healthy'
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      features: [
        'Authentication (JWT + OAuth)',
        'Career Assessments',
        'Mentor Booking',
        'Payment Processing',
        'Career Roadmaps',
        'Learning Resources',
        'Admin Dashboard'
      ]
    };
  }
}