import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
// Update the import path if user.entity.ts is located elsewhere, for example:
// Update the import path to the correct location of user.entity.ts
import { User } from './user.entity';
// Or, if the file does not exist, create user.entity.ts in the same directory.
import { RoadmapStep } from './roadmap-step.entity';

@Entity('career_roadmaps')
export class CareerRoadmap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'target_career', nullable: true })
  targetCareer?: string;

  @Column({ name: 'estimated_duration_months', nullable: true })
  estimatedDurationMonths?: number;

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @Column({ name: 'is_custom', default: false })
  isCustom: boolean;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  tags?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  prerequisites?: string;

  @Column({
    name: 'learning_outcomes',
    type: 'text',
    nullable: true,
  })
  learningOutcomes?: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'based_on_assessment', type: 'uuid', nullable: true })
  basedOnAssessment?: string;

  @Column({
    name: 'completion_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  completionPercentage: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - Removed for MongoDB compatibility
  // User relationship managed via userId field
  
  @OneToMany(() => RoadmapStep, (step) => step.roadmap)
  steps: RoadmapStep[];

  // Helper methods for array fields
  setTags(tags: string[]) {
    this.tags = JSON.stringify(tags);
  }

  getTags(): string[] {
    return this.tags ? JSON.parse(this.tags) : [];
  }

  setPrerequisites(prerequisites: string[]) {
    this.prerequisites = JSON.stringify(prerequisites);
  }

  getPrerequisites(): string[] {
    return this.prerequisites ? JSON.parse(this.prerequisites) : [];
  }

  setLearningOutcomes(outcomes: string[]) {
    this.learningOutcomes = JSON.stringify(outcomes);
  }

  getLearningOutcomes(): string[] {
    return this.learningOutcomes ? JSON.parse(this.learningOutcomes) : [];
  }
}