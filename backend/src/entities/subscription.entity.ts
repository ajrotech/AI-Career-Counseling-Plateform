import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'plan_name' })
  planName: string;

  @Column({ name: 'plan_type', nullable: true })
  planType?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
    comment: 'Valid values: active, inactive, cancelled, expired',
  })
  status: string;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId?: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  @Column({ name: 'current_period_start', nullable: true })
  currentPeriodStart?: Date;

  @Column({ name: 'current_period_end', nullable: true })
  currentPeriodEnd?: Date;

  @Column({ name: 'trial_start', nullable: true })
  trialStart?: Date;

  @Column({ name: 'trial_end', nullable: true })
  trialEnd?: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  features?: string;

  @Column({
    name: 'usage_limits',
    type: 'text',
    nullable: true,
  })
  usageLimits?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.subscription)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods for JSON fields
  setFeatures(features: Record<string, any>) {
    this.features = JSON.stringify(features);
  }

  getFeatures(): Record<string, any> | null {
    return this.features ? JSON.parse(this.features) : null;
  }

  setUsageLimits(limits: Record<string, any>) {
    this.usageLimits = JSON.stringify(limits);
  }

  getUsageLimits(): Record<string, any> | null {
    return this.usageLimits ? JSON.parse(this.usageLimits) : null;
  }

  // Subscription status constants for validation
  static readonly SUBSCRIPTION_STATUSES = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
  } as const;

  isValidStatus(): boolean {
    return Object.values(Subscription.SUBSCRIPTION_STATUSES).includes(this.status as any);
  }
}