import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_start' })
  sessionStart: Date;

  @Column({ name: 'session_end', nullable: true })
  sessionEnd: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'device_type', nullable: true })
  deviceType: string;

  @Column({ name: 'browser', nullable: true })
  browser: string;

  @Column({ name: 'duration_seconds', default: 0 })
  durationSeconds: number;

  @Column({ name: 'pages_visited', type: 'json', nullable: true })
  pagesVisited: string[];

  @Column({ name: 'actions_count', default: 0 })
  actionsCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}