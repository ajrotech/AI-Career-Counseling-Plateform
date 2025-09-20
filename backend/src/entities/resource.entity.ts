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

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'article',
    comment: 'Valid values: article, video, course, book, podcast, tool, template, webinar, tutorial, certification, job_board, company_guide',
  })
  type: string;

  @Column()
  url: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'author_name', nullable: true })
  authorName?: string;

  @Column({ name: 'author_url', nullable: true })
  authorUrl?: string;

  @Column({ name: 'publisher_name', nullable: true })
  publisherName?: string;

  @Column({ name: 'published_at', nullable: true })
  publishedAt?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'beginner',
    comment: 'Valid values: beginner, intermediate, advanced, expert',
  })
  difficulty: string;

  @Column({ name: 'estimated_duration_minutes', nullable: true })
  estimatedDurationMinutes?: number;

  @Column({ name: 'is_free', default: true })
  isFree: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'bookmark_count', default: 0 })
  bookmarkCount: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  rating?: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  tags?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  categories?: string;

  @Column({
    name: 'skills_covered',
    type: 'text',
    nullable: true,
  })
  skillsCovered?: string;

  @Column({
    name: 'career_paths',
    type: 'text',
    nullable: true,
  })
  careerPaths?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  metadata?: string;

  @Column({ name: 'added_by', type: 'uuid', nullable: true })
  addedBy?: string;

  @Column({ name: 'last_updated', nullable: true })
  lastUpdated?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'added_by' })
  addedByUser?: User;

  // Helper methods for JSON fields
  setTags(tags: string[]) {
    this.tags = JSON.stringify(tags);
  }

  getTags(): string[] {
    return this.tags ? JSON.parse(this.tags) : [];
  }

  setCategories(categories: string[]) {
    this.categories = JSON.stringify(categories);
  }

  getCategories(): string[] {
    return this.categories ? JSON.parse(this.categories) : [];
  }

  setSkillsCovered(skills: string[]) {
    this.skillsCovered = JSON.stringify(skills);
  }

  getSkillsCovered(): string[] {
    return this.skillsCovered ? JSON.parse(this.skillsCovered) : [];
  }

  setCareerPaths(paths: string[]) {
    this.careerPaths = JSON.stringify(paths);
  }

  getCareerPaths(): string[] {
    return this.careerPaths ? JSON.parse(this.careerPaths) : [];
  }

  setMetadata(metadata: Record<string, any>) {
    this.metadata = JSON.stringify(metadata);
  }

  getMetadata(): Record<string, any> | null {
    return this.metadata ? JSON.parse(this.metadata) : null;
  }

  // Resource constants for validation
  static readonly RESOURCE_TYPES = {
    ARTICLE: 'article',
    VIDEO: 'video',
    COURSE: 'course',
    BOOK: 'book',
    PODCAST: 'podcast',
    TOOL: 'tool',
    TEMPLATE: 'template',
    WEBINAR: 'webinar',
    TUTORIAL: 'tutorial',
    CERTIFICATION: 'certification',
    JOB_BOARD: 'job_board',
    COMPANY_GUIDE: 'company_guide',
  } as const;

  static readonly DIFFICULTY_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
  } as const;

  isValidType(): boolean {
    return Object.values(Resource.RESOURCE_TYPES).includes(this.type as any);
  }

  isValidDifficulty(): boolean {
    return Object.values(Resource.DIFFICULTY_LEVELS).includes(this.difficulty as any);
  }
}