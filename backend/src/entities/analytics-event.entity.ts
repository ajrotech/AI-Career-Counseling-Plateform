import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { UserSession } from './user-session.entity';

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  ASSESSMENT_START = 'assessment_start',
  ASSESSMENT_COMPLETE = 'assessment_complete',
  CHAT_MESSAGE = 'chat_message',
  MENTOR_BOOKING = 'mentor_booking',
  RESOURCE_VIEW = 'resource_view',
  DOWNLOAD = 'download',
  SEARCH = 'search',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTRATION = 'registration',
}

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @ManyToOne(() => UserSession, session => session.id, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: UserSession;

  @Column({ 
    type: 'varchar',
    length: 50,
    name: 'event_type' 
  })
  eventType: AnalyticsEventType;

  @Column({ name: 'event_category', nullable: true })
  eventCategory: string;

  @Column({ name: 'event_action', nullable: true })
  eventAction: string;

  @Column({ name: 'event_label', nullable: true })
  eventLabel: string;

  @Column({ name: 'event_value', nullable: true })
  eventValue: number;

  @Column({ name: 'page_url', nullable: true })
  pageUrl: string;

  @Column({ name: 'page_title', nullable: true })
  pageTitle: string;

  @Column({ name: 'referrer', nullable: true })
  referrer: string;

  @Column({ name: 'properties', type: 'json', nullable: true })
  properties: Record<string, any>;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType: string;

  @Column({ name: 'browser', nullable: true })
  browser: string;

  @Column({ name: 'country', nullable: true })
  country: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}