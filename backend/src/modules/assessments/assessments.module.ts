import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from '../../entities/assessment.entity';
import { AssessmentQuestion } from '../../entities/assessment-question.entity';
import { AssessmentResult } from '../../entities/assessment-result.entity';
import { User } from '../../entities/user.entity';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Assessment, AssessmentQuestion, AssessmentResult, User])],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [TypeOrmModule, AssessmentsService],
})
export class AssessmentsModule {}