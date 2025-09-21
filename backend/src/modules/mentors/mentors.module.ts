import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';
import { Mentor } from '../../entities/mentor.entity';
import { Booking } from '../../entities/booking.entity';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mentor,
      Booking,
      User,
      UserProfile,
    ]),
  ],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [MentorsService],
})
export class MentorsModule {}