import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsDateString, IsEnum, IsArray, MinLength, MaxLength } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'johndoe_updated' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiProperty({ example: 'john.updated@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'Bachelor\'s Degree' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  currentEducation?: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fieldOfStudy?: string;

  @ApiProperty({ example: 5 })
  @IsOptional()
  yearsOfExperience?: number;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  currentJobTitle?: string;

  @ApiProperty({ example: 'Tech Corp' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  currentCompany?: string;

  @ApiProperty({ example: ['JavaScript', 'Python', 'React'] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiProperty({ example: ['Web Development', 'Machine Learning'] })
  @IsArray()
  @IsOptional()
  interests?: string[];

  @ApiProperty({ example: 'Passionate software developer with experience in full-stack development.' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({ example: 'https://linkedin.com/in/johndoe' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  linkedinUrl?: string;

  @ApiProperty({ example: 'https://github.com/johndoe' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  githubUrl?: string;

  @ApiProperty({ example: 'https://johndoe.dev' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  portfolioUrl?: string;
}