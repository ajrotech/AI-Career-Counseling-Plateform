import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_engagement_metrics')
export class UserEngagementMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'metric_date', type: 'date' })
  metricDate: Date;

  @Column({ name: 'total_sessions', default: 0 })
  totalSessions: number;

  @Column({ name: 'total_time_minutes', default: 0 })
  totalTimeMinutes: number;

  @Column({ name: 'pages_viewed', default: 0 })
  pagesViewed: number;

  @Column({ name: 'actions_taken', default: 0 })
  actionsTaken: number;

  @Column({ name: 'assessments_started', default: 0 })
  assessmentsStarted: number;

  @Column({ name: 'assessments_completed', default: 0 })
  assessmentsCompleted: number;

  @Column({ name: 'chat_messages_sent', default: 0 })
  chatMessagesSent: number;

  @Column({ name: 'mentor_sessions_booked', default: 0 })
  mentorSessionsBooked: number;

  @Column({ name: 'resources_viewed', default: 0 })
  resourcesViewed: number;

  @Column({ name: 'downloads_made', default: 0 })
  downloadsMade: number;

  @Column({ name: 'search_queries', default: 0 })
  searchQueries: number;

  @Column({ name: 'feature_usage', type: 'json', nullable: true })
  featureUsage: Record<string, number>;

  @Column({ name: 'engagement_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  engagementScore: number;

  @Column({ name: 'retention_indicator', default: false })
  retentionIndicator: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}