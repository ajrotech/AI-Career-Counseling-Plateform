import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEvent } from '../../entities/analytics-event.entity';
import { UserSession } from '../../entities/user-session.entity';
import { UserEngagementMetrics } from '../../entities/user-engagement-metrics.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      UserSession,
      UserEngagementMetrics,
      User,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}