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

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @Column({ name: 'subscription_id', type: 'uuid', nullable: true })
  subscriptionId?: string;

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
    default: 'pending',
    comment: 'Valid values: pending, completed, failed, refunded',
  })
  status: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod?: string;

  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId?: string;

  @Column({ name: 'stripe_charge_id', nullable: true })
  stripeChargeId?: string;

  @Column({
    name: 'transaction_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  transactionFee?: number;

  @Column({
    name: 'net_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  netAmount?: number;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  refundAmount: number;

  @Column({ name: 'refunded_at', nullable: true })
  refundedAt?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  metadata?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods for JSON fields
  setMetadata(metadata: Record<string, any>) {
    this.metadata = JSON.stringify(metadata);
  }

  getMetadata(): Record<string, any> | null {
    return this.metadata ? JSON.parse(this.metadata) : null;
  }

  // Payment status constants for validation
  static readonly PAYMENT_STATUSES = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  } as const;

  isValidStatus(): boolean {
    return Object.values(Payment.PAYMENT_STATUSES).includes(this.status as any);
  }
}