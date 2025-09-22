import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'general',
    comment: 'Valid values: booking_confirmation, booking_reminder, booking_cancelled, payment_success, payment_failed, assessment_completed, roadmap_updated, mentor_message, system_update, achievement_unlocked, deadline_reminder, welcome, general',
  })
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'unread',
    comment: 'Valid values: unread, read, archived',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'medium',
    comment: 'Valid values: low, medium, high, urgent',
  })
  priority: string;

  @Column({ name: 'action_url', nullable: true })
  actionUrl?: string;

  @Column({ name: 'action_text', nullable: true })
  actionText?: string;

  @Column({ name: 'is_push_sent', default: false })
  isPushSent: boolean;

  @Column({ name: 'is_email_sent', default: false })
  isEmailSent: boolean;

  @Column({ name: 'is_sms_sent', default: false })
  isSmsSent: boolean;

  @Column({ name: 'scheduled_for', nullable: true })
  scheduledFor?: Date;

  @Column({ name: 'read_at', nullable: true })
  readAt?: Date;

  @Column({ name: 'archived_at', nullable: true })
  archivedAt?: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  metadata?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  tags?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - Removed for MongoDB compatibility
  // User relationship managed via userId field

  // Helper methods for JSON fields
  setMetadata(metadata: Record<string, any>) {
    this.metadata = JSON.stringify(metadata);
  }

  getMetadata(): Record<string, any> | null {
    return this.metadata ? JSON.parse(this.metadata) : null;
  }

  setTags(tags: string[]) {
    this.tags = JSON.stringify(tags);
  }

  getTags(): string[] {
    return this.tags ? JSON.parse(this.tags) : [];
  }

  // Notification constants for validation
  static readonly NOTIFICATION_TYPES = {
    BOOKING_CONFIRMATION: 'booking_confirmation',
    BOOKING_REMINDER: 'booking_reminder',
    BOOKING_CANCELLED: 'booking_cancelled',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    ASSESSMENT_COMPLETED: 'assessment_completed',
    ROADMAP_UPDATED: 'roadmap_updated',
    MENTOR_MESSAGE: 'mentor_message',
    SYSTEM_UPDATE: 'system_update',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    DEADLINE_REMINDER: 'deadline_reminder',
    WELCOME: 'welcome',
    GENERAL: 'general',
  } as const;

  static readonly NOTIFICATION_STATUSES = {
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived',
  } as const;

  static readonly NOTIFICATION_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  } as const;

  isValidType(): boolean {
    return Object.values(Notification.NOTIFICATION_TYPES).includes(this.type as any);
  }

  isValidStatus(): boolean {
    return Object.values(Notification.NOTIFICATION_STATUSES).includes(this.status as any);
  }

  isValidPriority(): boolean {
    return Object.values(Notification.NOTIFICATION_PRIORITIES).includes(this.priority as any);
  }
}