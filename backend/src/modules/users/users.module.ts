import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { AssessmentResult } from '../../entities/assessment-result.entity';
import { Booking } from '../../entities/booking.entity';
import { Notification } from '../../entities/notification.entity';
import { UserProgress } from '../../entities/user-progress.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      UserProfile, 
      AssessmentResult, 
      Booking, 
      Notification, 
      UserProgress
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}