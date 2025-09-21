import { IsString, IsOptional, IsArray, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CareerField {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  EDUCATION = 'education',
  MARKETING = 'marketing',
  DESIGN = 'design',
  BUSINESS = 'business',
  SCIENCE = 'science',
  ENGINEERING = 'engineering',
  ARTS = 'arts',
  OTHER = 'other',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum WorkStyle {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ON_SITE = 'on_site',
  FLEXIBLE = 'flexible',
}

export class CareerRoadmapPreferencesDto {
  @ApiProperty({ 
    description: 'Preferred career field',
    enum: CareerField,
    example: CareerField.TECHNOLOGY
  })
  @IsEnum(CareerField)
  careerField: CareerField;

  @ApiProperty({ 
    description: 'Current experience level',
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ 
    description: 'Specific skills of interest',
    type: [String],
    example: ['JavaScript', 'React', 'Node.js']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ 
    description: 'Target timeline in months',
    example: 12,
    minimum: 1,
    maximum: 120
  })
  @IsNumber()
  @Min(1)
  @Max(120)
  timelineMonths: number;

  @ApiProperty({ 
    description: 'Preferred work style',
    enum: WorkStyle,
    example: WorkStyle.HYBRID
  })
  @IsEnum(WorkStyle)
  @IsOptional()
  workStyle?: WorkStyle;

  @ApiProperty({ 
    description: 'Target salary range minimum',
    example: 50000,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ 
    description: 'Target salary range maximum',
    example: 100000,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ 
    description: 'Additional preferences or requirements',
    example: 'Interested in leadership roles and continuous learning',
    required: false
  })
  @IsString()
  @IsOptional()
  additionalNotes?: string;
}