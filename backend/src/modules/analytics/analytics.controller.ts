import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService, TrackEventDto } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async trackEvent(@Body() data: TrackEventDto, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    await this.analyticsService.trackEvent({
      ...data,
      userId: userId || data.userId,
      ipAddress: ipAddress || data.ipAddress,
      userAgent: userAgent || data.userAgent,
    });

    return { success: true };
  }

  @Post('session/start')
  async startSession(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    const session = await this.analyticsService.startSession({
      userId,
      ipAddress,
      userAgent,
    });

    return { sessionId: session.id };
  }

  @Post('session/:sessionId/end')
  async endSession(@Param('sessionId') sessionId: string) {
    await this.analyticsService.endSession(sessionId);
    return { success: true };
  }

  @Post('session/:sessionId/activity')
  async updateSessionActivity(
    @Param('sessionId') sessionId: string,
    @Body() data: { pageUrl?: string }
  ) {
    await this.analyticsService.updateSessionActivity(sessionId, data.pageUrl);
    return { success: true };
  }

  @Get('dashboard')
  async getDashboardData(
    @Query('days') days: string = '30',
    @Req() req: Request
  ) {
    const userId = (req.user as any)?.id;
    const daysNumber = parseInt(days, 10) || 30;
    
    const data = await this.analyticsService.getDashboardData(userId, daysNumber);
    return data;
  }

  @Get('engagement/:userId')
  async getUserEngagement(
    @Param('userId') userId: string,
    @Query('date') date?: string
  ) {
    const targetDate = date ? new Date(date) : new Date();
    const metrics = await this.analyticsService.getUserEngagementMetrics(userId, targetDate);
    return metrics;
  }

  @Post('metrics/update')
  async updateDailyMetrics(@Req() req: Request) {
    const userId = (req.user as any)?.id;
    await this.analyticsService.updateDailyMetrics(userId);
    return { success: true };
  }
}