import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, Min, Max } from 'class-validator';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Mentor ID to book session with' })
  @IsString()
  mentorId: string;

  @ApiProperty({ description: 'Session title', example: 'Career Strategy Discussion' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ 
    description: 'Session description or agenda',
    example: 'Discuss career transition from marketing to product management'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Scheduled date and time in ISO format',
    example: '2025-09-25T14:30:00Z'
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ 
    description: 'Duration in minutes',
    example: 60
  })
  @IsNumber()
  @Min(15)
  @Max(180)
  durationMinutes: number;

  @ApiProperty({ 
    description: 'Additional notes for the mentor',
    example: 'First time mentee, looking for guidance on PM roles'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBookingDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(15)
  @Max(180)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mentorNotes?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class BookingSearchDto {
  @ApiProperty({ required: false })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mentorId?: string;

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