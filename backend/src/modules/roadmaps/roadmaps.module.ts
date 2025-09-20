import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerRoadmap } from '../../entities/career-roadmap.entity';
import { RoadmapStep } from '../../entities/roadmap-step.entity';
import { UserProgress } from '../../entities/user-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareerRoadmap, RoadmapStep, UserProgress])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class RoadmapsModule {}