import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Assessment } from './assessment.entity';

@Entity('assessment_questions')
export class AssessmentQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId: string;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({
    name: 'question_type',
    type: 'varchar',
    length: 50,
    comment: 'Valid values: multiple_choice, scale, text, boolean',
  })
  questionType: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  options?: string;

  @Column({ name: 'correct_answer', nullable: true })
  correctAnswer?: string;

  @Column({ default: 1 })
  points: number;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'is_required', default: true })
  isRequired: boolean;

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
  @ManyToOne(() => Assessment, (assessment) => assessment.questions)
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  // Helper methods for JSON fields
  setOptions(options: Record<string, any>) {
    this.options = JSON.stringify(options);
  }

  getOptions(): Record<string, any> | null {
    return this.options ? JSON.parse(this.options) : null;
  }

  setMetadata(metadata: Record<string, any>) {
    this.metadata = JSON.stringify(metadata);
  }

  getMetadata(): Record<string, any> | null {
    return this.metadata ? JSON.parse(this.metadata) : null;
  }

  // Question type constants for validation
  static readonly QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    SCALE: 'scale',
    TEXT: 'text',
    BOOLEAN: 'boolean',
  } as const;

  isValidQuestionType(): boolean {
    return Object.values(AssessmentQuestion.QUESTION_TYPES).includes(this.questionType as any);
  }
}