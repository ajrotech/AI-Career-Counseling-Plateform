import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // API versioning
    app.setGlobalPrefix('api/v1');

    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Career Counseling Platform API')
        .setDescription('AI-powered career guidance and counseling platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
  }
  
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app.getHttpAdapter().getInstance()(req, res);
}