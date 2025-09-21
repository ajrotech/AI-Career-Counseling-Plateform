import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent, AnalyticsEventType } from '../../entities/analytics-event.entity';
import { UserSession } from '../../entities/user-session.entity';
import { UserEngagementMetrics } from '../../entities/user-engagement-metrics.entity';
import { User } from '../../entities/user.entity';

export interface TrackEventDto {
  userId?: string;
  sessionId?: string;
  eventType: AnalyticsEventType;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  properties?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionData {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(UserEngagementMetrics)
    private userEngagementRepository: Repository<UserEngagementMetrics>,
  ) {}

  /**
   * Track an analytics event
   */
  async trackEvent(data: TrackEventDto): Promise<void> {
    try {
      const event = this.analyticsEventRepository.create({
        ...data,
        deviceType: this.getDeviceType(data.userAgent),
        browser: this.getBrowser(data.userAgent),
      });

      await this.analyticsEventRepository.save(event);
      this.logger.debug(`Tracked event: ${data.eventType} for user: ${data.userId}`);
    } catch (error) {
      this.logger.error('Failed to track event:', error);
    }
  }

  /**
   * Start a user session
   */
  async startSession(data: SessionData): Promise<UserSession> {
    try {
      const session = this.userSessionRepository.create({
        userId: data.userId,
        sessionStart: new Date(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceType: this.getDeviceType(data.userAgent),
        browser: this.getBrowser(data.userAgent),
        isActive: true,
      });

      const savedSession = await this.userSessionRepository.save(session);
      
      // Track session start event
      if (data.userId) {
        await this.trackEvent({
          userId: data.userId,
          sessionId: savedSession.id,
          eventType: AnalyticsEventType.LOGIN,
          eventCategory: 'session',
          eventAction: 'start',
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        });
      }

      this.logger.debug(`Started session: ${savedSession.id} for user: ${data.userId}`);
      return savedSession;
    } catch (error) {
      this.logger.error('Failed to start session:', error);
      throw error;
    }
  }

  /**
   * End a user session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { id: sessionId, isActive: true }
      });

      if (!session) {
        return;
      }

      const sessionEnd = new Date();
      const durationSeconds = Math.floor((sessionEnd.getTime() - session.sessionStart.getTime()) / 1000);

      await this.userSessionRepository.update(sessionId, {
        sessionEnd,
        durationSeconds,
        isActive: false,
      });

      // Track session end event
      if (session.userId) {
        await this.trackEvent({
          userId: session.userId,
          sessionId: sessionId,
          eventType: AnalyticsEventType.LOGOUT,
          eventCategory: 'session',
          eventAction: 'end',
          eventValue: durationSeconds,
        });
      }

      this.logger.debug(`Ended session: ${sessionId}, duration: ${durationSeconds}s`);
    } catch (error) {
      this.logger.error('Failed to end session:', error);
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string, pageUrl?: string): Promise<void> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { id: sessionId, isActive: true }
      });

      if (!session) {
        return;
      }

      let updates: Partial<UserSession> = {
        actionsCount: session.actionsCount + 1,
      };

      if (pageUrl && !session.pagesVisited?.includes(pageUrl)) {
        updates.pagesVisited = [...(session.pagesVisited || []), pageUrl];
      }

      await this.userSessionRepository.update(sessionId, updates);
    } catch (error) {
      this.logger.error('Failed to update session activity:', error);
    }
  }

  /**
   * Get user engagement metrics for a specific date
   */
  async getUserEngagementMetrics(userId: string, date: Date): Promise<UserEngagementMetrics> {
    const dateString = date.toISOString().split('T')[0];
    
    let metrics = await this.userEngagementRepository.findOne({
      where: { userId, metricDate: dateString as any }
    });

    if (!metrics) {
      metrics = this.userEngagementRepository.create({
        userId,
        metricDate: dateString as any,
      });
    }

    return metrics;
  }

  /**
   * Update daily engagement metrics for a user
   */
  async updateDailyMetrics(userId: string, date: Date = new Date()): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get events for the day
      const events = await this.analyticsEventRepository.find({
        where: {
          userId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          } as any,
        },
      });

      // Get sessions for the day
      const sessions = await this.userSessionRepository.find({
        where: {
          userId,
          sessionStart: {
            $gte: startOfDay,
            $lte: endOfDay,
          } as any,
        },
      });

      // Calculate metrics
      const totalSessions = sessions.length;
      const totalTimeMinutes = sessions.reduce((sum, session) => sum + (session.durationSeconds / 60), 0);
      const pagesViewed = events.filter(e => e.eventType === AnalyticsEventType.PAGE_VIEW).length;
      const actionsTaken = events.length;
      const assessmentsStarted = events.filter(e => e.eventType === AnalyticsEventType.ASSESSMENT_START).length;
      const assessmentsCompleted = events.filter(e => e.eventType === AnalyticsEventType.ASSESSMENT_COMPLETE).length;
      const chatMessagesSent = events.filter(e => e.eventType === AnalyticsEventType.CHAT_MESSAGE).length;
      const mentorSessionsBooked = events.filter(e => e.eventType === AnalyticsEventType.MENTOR_BOOKING).length;
      const resourcesViewed = events.filter(e => e.eventType === AnalyticsEventType.RESOURCE_VIEW).length;
      const downloadsMade = events.filter(e => e.eventType === AnalyticsEventType.DOWNLOAD).length;
      const searchQueries = events.filter(e => e.eventType === AnalyticsEventType.SEARCH).length;

      // Calculate engagement score (0-100)
      const engagementScore = this.calculateEngagementScore({
        totalSessions,
        totalTimeMinutes,
        pagesViewed,
        actionsTaken,
        assessmentsCompleted,
        chatMessagesSent,
      });

      // Get or create metrics record
      let metrics = await this.getUserEngagementMetrics(userId, date);
      
      // Update metrics
      Object.assign(metrics, {
        totalSessions,
        totalTimeMinutes: Math.round(totalTimeMinutes),
        pagesViewed,
        actionsTaken,
        assessmentsStarted,
        assessmentsCompleted,
        chatMessagesSent,
        mentorSessionsBooked,
        resourcesViewed,
        downloadsMade,
        searchQueries,
        engagementScore,
        retentionIndicator: engagementScore > 50,
      });

      await this.userEngagementRepository.save(metrics);
      this.logger.debug(`Updated daily metrics for user: ${userId}, engagement score: ${engagementScore}`);
    } catch (error) {
      this.logger.error('Failed to update daily metrics:', error);
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(userId: string, days: number = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [events, sessions, metrics] = await Promise.all([
        this.analyticsEventRepository.find({
          where: {
            userId,
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            } as any,
          },
          order: { createdAt: 'DESC' },
        }),
        this.userSessionRepository.find({
          where: {
            userId,
            sessionStart: {
              $gte: startDate,
              $lte: endDate,
            } as any,
          },
          order: { sessionStart: 'DESC' },
        }),
        this.userEngagementRepository.find({
          where: {
            userId,
            metricDate: {
              $gte: startDate.toISOString().split('T')[0],
              $lte: endDate.toISOString().split('T')[0],
            } as any,
          },
          order: { metricDate: 'DESC' },
        }),
      ]);

      return {
        totalEvents: events.length,
        totalSessions: sessions.length,
        totalTimeMinutes: sessions.reduce((sum, s) => sum + (s.durationSeconds / 60), 0),
        averageEngagementScore: metrics.length > 0 
          ? metrics.reduce((sum, m) => sum + m.engagementScore, 0) / metrics.length
          : 0,
        recentEvents: events.slice(0, 20),
        dailyMetrics: metrics,
        eventsByType: this.groupEventsByType(events),
        sessionTrends: this.calculateSessionTrends(sessions),
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard data:', error);
      return {};
    }
  }

  private calculateEngagementScore(data: {
    totalSessions: number;
    totalTimeMinutes: number;
    pagesViewed: number;
    actionsTaken: number;
    assessmentsCompleted: number;
    chatMessagesSent: number;
  }): number {
    let score = 0;

    // Session activity (0-20 points)
    score += Math.min(data.totalSessions * 5, 20);

    // Time spent (0-20 points)
    score += Math.min(data.totalTimeMinutes / 2, 20);

    // Page engagement (0-15 points)
    score += Math.min(data.pagesViewed * 1.5, 15);

    // Actions taken (0-15 points)
    score += Math.min(data.actionsTaken * 0.5, 15);

    // Assessments completed (0-20 points)
    score += Math.min(data.assessmentsCompleted * 10, 20);

    // Chat engagement (0-10 points)
    score += Math.min(data.chatMessagesSent * 0.5, 10);

    return Math.round(Math.min(score, 100));
  }

  private getDeviceType(userAgent: string): string {
    if (!userAgent) return 'unknown';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  private getBrowser(userAgent: string): string {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'other';
  }

  private groupEventsByType(events: AnalyticsEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateSessionTrends(sessions: UserSession[]): any[] {
    const dailyData = sessions.reduce((acc, session) => {
      const date = session.sessionStart.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, sessions: 0, totalTime: 0 };
      }
      acc[date].sessions++;
      acc[date].totalTime += session.durationSeconds / 60;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }
}