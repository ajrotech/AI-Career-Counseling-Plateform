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
import { CareerRoadmap } from './career-roadmap.entity';
import { RoadmapStep } from './roadmap-step.entity';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'roadmap_id', type: 'uuid', nullable: true })
  roadmapId?: string;

  @Column({ name: 'step_id', type: 'uuid', nullable: true })
  stepId?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'not_started',
    comment: 'Valid values: not_started, in_progress, completed, on_hold, cancelled',
  })
  status: string;

  @Column({
    name: 'completion_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  completionPercentage: number;

  @Column({ name: 'time_spent_minutes', default: 0 })
  timeSpentMinutes: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ name: 'last_accessed_at', nullable: true })
  lastAccessedAt?: Date;

  @Column({ name: 'streak_days', default: 0 })
  streakDays: number;

  @Column({ name: 'total_study_days', default: 0 })
  totalStudyDays: number;

  @Column({
    name: 'milestones_achieved',
    type: 'text',
    nullable: true,
  })
  milestonesAchieved?: string;

  @Column({
    name: 'challenges_faced',
    type: 'text',
    nullable: true,
  })
  challengesFaced?: string;

  @Column({
    name: 'resources_used',
    type: 'text',
    nullable: true,
  })
  resourcesUsed?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - Removed for MongoDB compatibility
  // User relationship managed via userId field

  @ManyToOne(() => CareerRoadmap, { nullable: true })
  @JoinColumn({ name: 'roadmap_id' })
  roadmap?: CareerRoadmap;

  @ManyToOne(() => RoadmapStep, { nullable: true })
  @JoinColumn({ name: 'step_id' })
  step?: RoadmapStep;

  // Helper methods for array fields
  setChallengesFaced(challenges: string[]) {
    this.challengesFaced = JSON.stringify(challenges);
  }

  getChallengesFaced(): string[] {
    return this.challengesFaced ? JSON.parse(this.challengesFaced) : [];
  }

  setResourcesUsed(resources: string[]) {
    this.resourcesUsed = JSON.stringify(resources);
  }

  getResourcesUsed(): string[] {
    return this.resourcesUsed ? JSON.parse(this.resourcesUsed) : [];
  }

  // Progress status constants for validation
  static readonly PROGRESS_STATUSES = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ON_HOLD: 'on_hold',
    CANCELLED: 'cancelled',
  } as const;

  isValidStatus(): boolean {
    return Object.values(UserProgress.PROGRESS_STATUSES).includes(this.status as any);
  }

  getMilestonesAchieved(): string[] {
    return this.milestonesAchieved ? JSON.parse(this.milestonesAchieved) : [];
  }

  setMilestonesAchieved(milestones: string[]) {
    this.milestonesAchieved = JSON.stringify(milestones);
  }
}