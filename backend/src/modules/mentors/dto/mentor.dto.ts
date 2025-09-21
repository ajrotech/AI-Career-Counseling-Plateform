import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min, Max, IsEnum } from 'class-validator';

export interface DayAvailability {
  available: boolean;
  slots: string[]; // Format: "HH:MM-HH:MM"
}

export interface WeeklyAvailability {
  monday?: DayAvailability;
  tuesday?: DayAvailability;
  wednesday?: DayAvailability;
  thursday?: DayAvailability;
  friday?: DayAvailability;
  saturday?: DayAvailability;
  sunday?: DayAvailability;
}

export enum MentorSpecialization {
  SOFTWARE_ENGINEERING = 'software_engineering',
  DATA_SCIENCE = 'data_science',
  PRODUCT_MANAGEMENT = 'product_management',
  DESIGN = 'design',
  MARKETING = 'marketing',
  FINANCE = 'finance',
  CONSULTING = 'consulting',
  ENTREPRENEURSHIP = 'entrepreneurship',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  LEGAL = 'legal',
  SALES = 'sales',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export class CreateMentorProfileDto {
  @ApiProperty({ 
    description: 'Areas of expertise',
    example: ['Software Engineering', 'Career Development', 'Leadership']
  })
  @IsArray()
  @IsString({ each: true })
  expertiseAreas: string[];

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience: number;

  @ApiProperty({ example: 'Tech Corp Inc.' })
  @IsString()
  @IsOptional()
  currentCompany?: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @IsOptional()
  currentPosition?: string;

  @ApiProperty({ 
    description: 'Educational background',
    example: 'MS Computer Science from Stanford University'
  })
  @IsString()
  @IsOptional()
  educationBackground?: string;

  @ApiProperty({ 
    description: 'Professional certifications',
    example: ['AWS Certified Solutions Architect', 'Scrum Master']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @ApiProperty({ 
    description: 'Hourly rate in USD',
    example: 150.00
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @ApiProperty({ 
    description: 'Weekly availability schedule',
    example: {
      monday: { available: true, slots: ['09:00-17:00'] },
      tuesday: { available: true, slots: ['09:00-17:00'] },
      wednesday: { available: false, slots: [] }
    }
  })
  @IsOptional()
  availability?: WeeklyAvailability;

  @ApiProperty({ 
    description: 'Mentor specializations',
    enum: MentorSpecialization,
    isArray: true
  })
  @IsArray()
  @IsEnum(MentorSpecialization, { each: true })
  @IsOptional()
  specializations?: MentorSpecialization[];

  @ApiProperty({ 
    description: 'Languages spoken',
    example: ['English', 'Spanish', 'French']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languagesSpoken?: string[];
}

export class UpdateMentorProfileDto {
  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expertiseAreas?: string[];

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsOfExperience?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currentCompany?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currentPosition?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  educationBackground?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @ApiProperty({ required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  availability?: WeeklyAvailability;

  @ApiProperty({ required: false })
  @IsArray()
  @IsEnum(MentorSpecialization, { each: true })
  @IsOptional()
  specializations?: MentorSpecialization[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languagesSpoken?: string[];
}

export class MentorSearchDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  expertise?: string;

  @ApiProperty({ required: false })
  @IsEnum(MentorSpecialization)
  @IsOptional()
  specialization?: MentorSpecialization;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minRating?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxHourlyRate?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ required: false, description: 'Number of results per page', example: 10 })
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Page offset', example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}