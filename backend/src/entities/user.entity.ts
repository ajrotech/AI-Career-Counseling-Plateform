import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'student',
    comment: 'Role: student, mentor, admin, institution_admin'
  })
  role: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'datetime', nullable: true })
  emailVerificationExpires: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string;

  @Column({ type: 'datetime', nullable: true })
  passwordResetExpires: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'integer', default: 0 })
  loginAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  lockedUntil: Date;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'datetime', nullable: true })
  refreshTokenExpires: Date;

  @Column({ type: 'text', nullable: true })
  oauthProviders: string; // JSON array of oauth providers like ['google', 'linkedin']

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedinId: string;

  @Column({ type: 'text', nullable: true })
  preferences: string; // JSON object for user preferences

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'boolean', default: true })
  notificationSettings: boolean;

  @Column({ type: 'text', nullable: true })
  twoFactorSecret: string;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  twoFactorRecoveryCodes: string; // JSON array of recovery codes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations - using lazy loading to avoid circular imports
  @OneToOne('UserProfile', 'user', { cascade: true })
  profile: any;

  @OneToOne('Mentor', 'user', { cascade: true })
  mentor: any;

  @OneToMany('AssessmentResult', 'user')
  assessmentResults: any[];

  @OneToMany('Booking', 'student')
  bookings: any[];

  @OneToMany('Payment', 'user')
  payments: any[];

  @OneToOne('Subscription', 'user')
  subscription: any;

  @OneToMany('CareerRoadmap', 'user')
  careerRoadmaps: any[];

  @OneToMany('UserProgress', 'user')
  progress: any[];

  @OneToMany('Notification', 'user')
  notifications: any[];

  @OneToMany('Resource', 'createdBy')
  createdResources: any[];

  @OneToMany('ChatSession', 'user')
  chatSessions: any[];

  @OneToMany('ChatMessage', 'user')
  chatMessages: any[];

  // Methods
  isAccountLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  // Helper method to parse oauth providers
  getOAuthProviders(): string[] {
    try {
      return JSON.parse(this.oauthProviders || '[]');
    } catch {
      return [];
    }
  }

  // Helper method to set oauth providers
  setOAuthProviders(providers: string[]): void {
    this.oauthProviders = JSON.stringify(providers);
  }

  // Helper method to get preferences
  getPreferences(): any {
    try {
      return JSON.parse(this.preferences || '{}');
    } catch {
      return {};
    }
  }

  // Helper method to set preferences
  setPreferences(prefs: any): void {
    this.preferences = JSON.stringify(prefs);
  }

  // Helper method to get recovery codes
  getRecoveryCodes(): string[] {
    try {
      return JSON.parse(this.twoFactorRecoveryCodes || '[]');
    } catch {
      return [];
    }
  }

  // Helper method to set recovery codes
  setRecoveryCodes(codes: string[]): void {
    this.twoFactorRecoveryCodes = JSON.stringify(codes);
  }
}