import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AssessmentResponseDto {
  @ApiProperty({ description: 'Question ID' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'User\'s answer to the question' })
  answer: string | number | string[];
}

export class CreateAssessmentSubmissionDto {
  @ApiProperty({ description: 'Assessment ID' })
  @IsString()
  assessmentId: string;

  @ApiProperty({ description: 'Array of responses to questions', type: [AssessmentResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentResponseDto)
  responses: AssessmentResponseDto[];

  @ApiProperty({ description: 'Time spent on assessment in seconds' })
  @IsNumber()
  timeSpent: number;
}