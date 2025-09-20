import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AssessmentResult } from './assessment-result.entity';
import { AssessmentQuestion } from './assessment-question.entity';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Valid values: aptitude, personality, interest, skills',
  })
  type: string;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ name: 'time_limit_minutes', nullable: true })
  timeLimitMinutes?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ default: '1.0' })
  version: string;

  @Column({
    name: 'scoring_algorithm',
    type: 'text',
    nullable: true,
  })
  scoringAlgorithm?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => AssessmentQuestion, (question) => question.assessment)
  questions: AssessmentQuestion[];

  @OneToMany(() => AssessmentResult, (result) => result.assessment)
  results: AssessmentResult[];

  // Helper methods for JSON fields
  setScoringAlgorithm(algorithm: Record<string, any>) {
    this.scoringAlgorithm = JSON.stringify(algorithm);
  }

  getScoringAlgorithm(): Record<string, any> | null {
    return this.scoringAlgorithm ? JSON.parse(this.scoringAlgorithm) : null;
  }

  // Assessment type constants for validation
  static readonly ASSESSMENT_TYPES = {
    APTITUDE: 'aptitude',
    PERSONALITY: 'personality',
    INTEREST: 'interest',
    SKILLS: 'skills',
  } as const;

  isValidType(): boolean {
    return Object.values(Assessment.ASSESSMENT_TYPES).includes(this.type as any);
  }
}