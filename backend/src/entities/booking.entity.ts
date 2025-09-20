import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'mentor_id', type: 'uuid' })
  mentorId: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'scheduled_at' })
  scheduledAt: Date;

  @Column({ name: 'duration_minutes', default: 60 })
  durationMinutes: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
    comment: 'Status: pending, confirmed, completed, cancelled, no_show'
  })
  status: string;

  @Column({ name: 'meeting_url', nullable: true })
  meetingUrl?: string;

  @Column({ name: 'meeting_id', nullable: true })
  meetingId?: string;

  @Column({ name: 'meeting_password', nullable: true })
  meetingPassword?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'mentor_notes', type: 'text', nullable: true })
  mentorNotes?: string;

  @Column({ nullable: true })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ name: 'mentor_feedback', type: 'text', nullable: true })
  mentorFeedback?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amount?: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy?: string;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'reminder_sent', default: false })
  reminderSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - using lazy loading to avoid circular imports
  @ManyToOne('User', 'bookings')
  @JoinColumn({ name: 'student_id' })
  student: any;

  @ManyToOne('Mentor', 'bookings')
  @JoinColumn({ name: 'mentor_id' })
  mentor: any;
}