import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from '../../entities/assessment.entity';
import { AssessmentQuestion } from '../../entities/assessment-question.entity';
import { AssessmentResult } from '../../entities/assessment-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assessment, AssessmentQuestion, AssessmentResult])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class AssessmentsModule {}