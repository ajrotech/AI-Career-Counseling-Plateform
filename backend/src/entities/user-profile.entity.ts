import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: true,
    comment: 'Gender: male, female, other, prefer_not_to_say'
  })
  gender: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  profilePicture: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentEducation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fieldOfStudy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  institution: string;

  @Column({ type: 'integer', nullable: true })
  graduationYear: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentJobTitle: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentCompany: string;

  @Column({ type: 'integer', nullable: true })
  yearsOfExperience: number;

  @Column({ type: 'text', nullable: true })
  skills: string; // JSON string for array of skills

  @Column({ type: 'text', nullable: true })
  interests: string; // JSON string for array of interests

  @Column({ type: 'text', nullable: true })
  careerGoals: string;

  @Column({ type: 'text', nullable: true })
  linkedinProfile: string;

  @Column({ type: 'text', nullable: true })
  githubProfile: string;

  @Column({ type: 'text', nullable: true })
  portfolioWebsite: string;

  @Column({ type: 'text', nullable: true })
  preferredIndustries: string; // JSON string for array of industries

  @Column({ type: 'text', nullable: true })
  preferredJobTypes: string; // JSON string for array of job types

  @Column({ type: 'text', nullable: true })
  preferredWorkEnvironment: string; // JSON string for work environment preferences

  @Column({ type: 'integer', default: 0 })
  profileCompleteness: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // User relationship - using lazy loading to avoid circular import
  @OneToOne('User', 'profile')
  @JoinColumn()
  user: any;

  // Helper methods for JSON fields
  getSkills(): string[] {
    try {
      return this.skills ? JSON.parse(this.skills) : [];
    } catch {
      return [];
    }
  }

  setSkills(skills: string[]): void {
    this.skills = JSON.stringify(skills);
  }

  getInterests(): string[] {
    try {
      return this.interests ? JSON.parse(this.interests) : [];
    } catch {
      return [];
    }
  }

  setInterests(interests: string[]): void {
    this.interests = JSON.stringify(interests);
  }

  getPreferredIndustries(): string[] {
    try {
      return this.preferredIndustries ? JSON.parse(this.preferredIndustries) : [];
    } catch {
      return [];
    }
  }

  setPreferredIndustries(industries: string[]): void {
    this.preferredIndustries = JSON.stringify(industries);
  }

  getPreferredJobTypes(): string[] {
    try {
      return this.preferredJobTypes ? JSON.parse(this.preferredJobTypes) : [];
    } catch {
      return [];
    }
  }

  setPreferredJobTypes(jobTypes: string[]): void {
    this.preferredJobTypes = JSON.stringify(jobTypes);
  }

  getPreferredWorkEnvironment(): any {
    try {
      return this.preferredWorkEnvironment ? JSON.parse(this.preferredWorkEnvironment) : {};
    } catch {
      return {};
    }
  }

  setPreferredWorkEnvironment(environment: any): void {
    this.preferredWorkEnvironment = JSON.stringify(environment);
  }
}