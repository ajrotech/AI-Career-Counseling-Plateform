import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('mentors')
export class Mentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'expertise_areas',
    type: 'text',
    nullable: true,
  })
  expertiseAreas?: string;

  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience?: number;

  @Column({ name: 'current_company', nullable: true })
  currentCompany?: string;

  @Column({ name: 'current_position', nullable: true })
  currentPosition?: string;

  @Column({ name: 'education_background', type: 'text', nullable: true })
  educationBackground?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  certifications?: string;

  @Column({
    name: 'hourly_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  hourlyRate?: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'JSON string for mentor availability schedule'
  })
  availability?: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.00,
  })
  rating: number;

  @Column({ name: 'total_sessions', default: 0 })
  totalSessions: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({
    name: 'verification_documents',
    type: 'text',
    nullable: true,
    comment: 'JSON string for verification documents'
  })
  verificationDocuments?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  specializations?: string;

  @Column({
    name: 'languages_spoken',
    type: 'text',
    default: 'English',
    comment: 'JSON string for languages spoken array'
  })
  languagesSpoken: string;

  @Column({
    name: 'calendar_integration',
    type: 'text',
    nullable: true,
    comment: 'JSON string for calendar integration settings'
  })
  calendarIntegration?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - using lazy loading to avoid circular imports
  @OneToOne('User', 'mentor')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @OneToMany('Booking', 'mentor')
  bookings: any[];

  // Helper methods for JSON fields
  getAvailability(): any {
    try {
      return this.availability ? JSON.parse(this.availability) : {};
    } catch {
      return {};
    }
  }

  setAvailability(availability: any): void {
    this.availability = JSON.stringify(availability);
  }

  getVerificationDocuments(): any {
    try {
      return this.verificationDocuments ? JSON.parse(this.verificationDocuments) : {};
    } catch {
      return {};
    }
  }

  setVerificationDocuments(documents: any): void {
    this.verificationDocuments = JSON.stringify(documents);
  }

  getLanguagesSpoken(): string[] {
    try {
      return this.languagesSpoken ? JSON.parse(this.languagesSpoken) : ['English'];
    } catch {
      return ['English'];
    }
  }

  setLanguagesSpoken(languages: string[]): void {
    this.languagesSpoken = JSON.stringify(languages);
  }

  getCalendarIntegration(): any {
    try {
      return this.calendarIntegration ? JSON.parse(this.calendarIntegration) : {};
    } catch {
      return {};
    }
  }

  setCalendarIntegration(integration: any): void {
    this.calendarIntegration = JSON.stringify(integration);
  }

  // Helper methods for array fields
  getExpertiseAreas(): string[] {
    return this.expertiseAreas ? JSON.parse(this.expertiseAreas) : [];
  }

  setExpertiseAreas(areas: string[]): void {
    this.expertiseAreas = JSON.stringify(areas);
  }

  getCertifications(): string[] {
    return this.certifications ? JSON.parse(this.certifications) : [];
  }

  setCertifications(certs: string[]): void {
    this.certifications = JSON.stringify(certs);
  }

  getSpecializations(): string[] {
    return this.specializations ? JSON.parse(this.specializations) : [];
  }

  setSpecializations(specs: string[]): void {
    this.specializations = JSON.stringify(specs);
  }
}