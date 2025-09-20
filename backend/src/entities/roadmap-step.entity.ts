import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CareerRoadmap } from './career-roadmap.entity';

@Entity('roadmap_steps')
export class RoadmapStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'roadmap_id', type: 'uuid' })
  roadmapId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'skill_development',
    comment: 'Valid values: course, certification, project, skill_development, networking, job_application, interview_prep, portfolio',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'not_started',
    comment: 'Valid values: not_started, in_progress, completed, skipped',
  })
  status: string;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'estimated_duration_days', nullable: true })
  estimatedDurationDays?: number;

  @Column({ name: 'is_required', default: true })
  isRequired: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  resources?: string;

  @Column({
    name: 'skills_gained',
    type: 'text',
    nullable: true,
  })
  skillsGained?: string;

  @Column({ name: 'external_url', nullable: true })
  externalUrl?: string;

  @Column({ name: 'cost_estimate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costEstimate?: number;

  @Column({ name: 'completion_criteria', type: 'text', nullable: true })
  completionCriteria?: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ name: 'due_date', nullable: true })
  dueDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CareerRoadmap, (roadmap) => roadmap.steps)
  @JoinColumn({ name: 'roadmap_id' })
  roadmap: CareerRoadmap;

  // Step type constants for validation
  static readonly STEP_TYPES = {
    COURSE: 'course',
    CERTIFICATION: 'certification',
    PROJECT: 'project',
    SKILL_DEVELOPMENT: 'skill_development',
    NETWORKING: 'networking',
    JOB_APPLICATION: 'job_application',
    INTERVIEW_PREP: 'interview_prep',
    PORTFOLIO: 'portfolio',
  } as const;

  static readonly STEP_STATUSES = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SKIPPED: 'skipped',
  } as const;

  isValidType(): boolean {
    return Object.values(RoadmapStep.STEP_TYPES).includes(this.type as any);
  }

  isValidStatus(): boolean {
    return Object.values(RoadmapStep.STEP_STATUSES).includes(this.status as any);
  }

  // Helper methods for array fields
  setResources(resources: string[]) {
    this.resources = JSON.stringify(resources);
  }

  getResources(): string[] {
    return this.resources ? JSON.parse(this.resources) : [];
  }

  setSkillsGained(skills: string[]) {
    this.skillsGained = JSON.stringify(skills);
  }

  getSkillsGained(): string[] {
    return this.skillsGained ? JSON.parse(this.skillsGained) : [];
  }
}