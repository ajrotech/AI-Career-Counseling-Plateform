import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);
  const isProduction = process.env.NODE_ENV === 'production';

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "wss:", "ws:", "https://api.openai.com", "https://api.anthropic.com"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Compression
  app.use(compression());

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe with enhanced security
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: isProduction, // Hide validation details in production
  }));

  // CORS configuration
  const allowedOrigins = [
    configService.get('FRONTEND_URL', 'http://localhost:3000'),
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
  ];

  if (isProduction) {
    allowedOrigins.push('https://career-counseling-platform.vercel.app');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Enhanced Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Career Counseling Platform API')
    .setDescription(`
      Comprehensive API for the Career Counseling Platform providing:
      - User authentication and authorization
      - AI-powered career guidance and chat
      - Assessment and evaluation tools  
      - Mentorship and booking systems
      - Analytics and user tracking
      - File processing and document analysis
      
      ## Authentication
      Most endpoints require authentication via Bearer token.
      Use the /auth/login endpoint to obtain an access token.
      
      ## Rate Limiting
      API endpoints are rate-limited to prevent abuse:
      - General API: 100 requests per minute
      - Authentication: 5 requests per 15 minutes
      - Chat: 30 messages per minute
      - File uploads: 10 uploads per minute
      
      ## Security
      All data is transmitted over HTTPS in production.
      Sensitive information is properly encrypted and secured.
    `)
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://career-counseling-platform.com/support',
      'support@career-counseling-platform.com'
    )
    .setLicense(
      'MIT License',
      'https://github.com/career-counseling-platform/blob/main/LICENSE'
    )
    .addServer('http://localhost:3001/api/v1', 'Development server')
    .addServer('https://api.career-counseling.com/api/v1', 'Production server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User registration, login, and token management')
    .addTag('Users', 'User profile management and preferences')
    .addTag('Chat', 'AI-powered career counseling chat system')
    .addTag('Assessments', 'Career assessments and evaluations')
    .addTag('Mentors', 'Mentor profiles and booking system')
    .addTag('Analytics', 'User analytics and engagement tracking')
    .addTag('Admin', 'Administrative endpoints and system management')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  // Serve enhanced Swagger documentation
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Career Counseling Platform API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2563eb; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  
  console.log(`🚀 Career Counseling Platform API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();