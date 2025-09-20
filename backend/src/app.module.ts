import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';

// Core modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Database configuration
import { typeOrmConfig } from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),

    // Cache (Redis) - Simplified configuration
    CacheModule.register({
      isGlobal: true,
      ttl: 600, // 10 minutes default TTL
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Rate limiting - Simplified configuration
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // Application modules
    AuthModule,
    UsersModule,
    MentorsModule,
    AssessmentsModule,
    BookingsModule,
    PaymentsModule,
    RoadmapsModule,
    ResourcesModule,
    AdminModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}