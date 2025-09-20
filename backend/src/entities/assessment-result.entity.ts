import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('assessment_results')
export class AssessmentResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId: string;

  @Column({ 
    type: 'text',
    comment: 'JSON string for assessment responses'
  })
  responses: string;

  @Column({ name: 'raw_score', nullable: true })
  rawScore?: number;

  @Column({
    name: 'percentage_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  percentageScore?: number;

  @Column({
    name: 'category_scores',
    type: 'text',
    nullable: true,
    comment: 'JSON string for category scores'
  })
  categoryScores?: string;

  @Column({
    name: 'personality_traits',
    type: 'text',
    nullable: true,
    comment: 'JSON string for personality traits'
  })
  personalityTraits?: string;

  @Column({ type: 'text', nullable: true })
  recommendations?: string;

  @Column({ name: 'completed_at', default: () => 'CURRENT_TIMESTAMP' })
  completedAt: Date;

  @Column({ name: 'time_taken_minutes', nullable: true })
  timeTakenMinutes?: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations - using lazy loading to avoid circular imports
  @ManyToOne('User', 'assessmentResults')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Assessment', 'results')
  @JoinColumn({ name: 'assessment_id' })
  assessment: any;

  // Helper methods for JSON fields
  getResponses(): any {
    try {
      return this.responses ? JSON.parse(this.responses) : {};
    } catch {
      return {};
    }
  }

  setResponses(responses: any): void {
    this.responses = JSON.stringify(responses);
  }

  getCategoryScores(): any {
    try {
      return this.categoryScores ? JSON.parse(this.categoryScores) : {};
    } catch {
      return {};
    }
  }

  setCategoryScores(scores: any): void {
    this.categoryScores = JSON.stringify(scores);
  }

  getPersonalityTraits(): any {
    try {
      return this.personalityTraits ? JSON.parse(this.personalityTraits) : {};
    } catch {
      return {};
    }
  }

  setPersonalityTraits(traits: any): void {
    this.personalityTraits = JSON.stringify(traits);
  }
}