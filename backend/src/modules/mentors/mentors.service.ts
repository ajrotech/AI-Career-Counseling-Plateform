import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThan, Between, In } from 'typeorm';
import { Mentor } from '../../entities/mentor.entity';
import { Booking } from '../../entities/booking.entity';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { 
  CreateMentorProfileDto, 
  UpdateMentorProfileDto, 
  MentorSearchDto,
  MentorSpecialization 
} from './dto/mentor.dto';
import { 
  CreateBookingDto, 
  UpdateBookingDto, 
  BookingSearchDto,
  BookingStatus 
} from './dto/booking.dto';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  // Mentor Profile Management
  async createMentorProfile(userId: string, createMentorDto: CreateMentorProfileDto) {
    // Check if user already has a mentor profile
    const existingMentor = await this.mentorRepository.findOne({
      where: { userId },
    });

    if (existingMentor) {
      throw new ConflictException('User already has a mentor profile');
    }

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const mentor = this.mentorRepository.create({
      userId,
      expertiseAreas: JSON.stringify(createMentorDto.expertiseAreas),
      yearsOfExperience: createMentorDto.yearsOfExperience,
      currentCompany: createMentorDto.currentCompany,
      currentPosition: createMentorDto.currentPosition,
      educationBackground: createMentorDto.educationBackground,
      certifications: createMentorDto.certifications ? JSON.stringify(createMentorDto.certifications) : null,
      hourlyRate: createMentorDto.hourlyRate,
      availability: createMentorDto.availability ? JSON.stringify(createMentorDto.availability) : null,
      specializations: createMentorDto.specializations ? JSON.stringify(createMentorDto.specializations) : null,
      languagesSpoken: createMentorDto.languagesSpoken ? JSON.stringify(createMentorDto.languagesSpoken) : JSON.stringify(['English']),
    });

    const savedMentor = await this.mentorRepository.save(mentor);
    return this.getMentorProfile(savedMentor.id);
  }

  async getMentorProfile(mentorId: string) {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor profile not found');
    }

    // Get user and profile information
    const user = await this.userRepository.findOne({
      where: { id: mentor.userId },
      relations: ['profile'],
    });

    return {
      id: mentor.id,
      userId: mentor.userId,
      user: user ? {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile,
      } : null,
      expertiseAreas: mentor.getExpertiseAreas(),
      yearsOfExperience: mentor.yearsOfExperience,
      currentCompany: mentor.currentCompany,
      currentPosition: mentor.currentPosition,
      educationBackground: mentor.educationBackground,
      certifications: mentor.getCertifications(),
      hourlyRate: mentor.hourlyRate,
      availability: mentor.getAvailability(),
      rating: mentor.rating,
      totalSessions: mentor.totalSessions,
      isVerified: mentor.isVerified,
      specializations: mentor.getSpecializations(),
      languagesSpoken: mentor.getLanguagesSpoken(),
      calendarIntegration: mentor.getCalendarIntegration(),
      createdAt: mentor.createdAt,
      updatedAt: mentor.updatedAt,
    };
  }

  async getMentorProfileByUserId(userId: string) {
    const mentor = await this.mentorRepository.findOne({
      where: { userId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor profile not found for this user');
    }

    return this.getMentorProfile(mentor.id);
  }

  async updateMentorProfile(mentorId: string, userId: string, updateMentorDto: UpdateMentorProfileDto) {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor profile not found');
    }

    // Verify ownership
    if (mentor.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this mentor profile');
    }

    // Update fields
    if (updateMentorDto.expertiseAreas !== undefined) {
      mentor.setExpertiseAreas(updateMentorDto.expertiseAreas);
    }
    if (updateMentorDto.yearsOfExperience !== undefined) {
      mentor.yearsOfExperience = updateMentorDto.yearsOfExperience;
    }
    if (updateMentorDto.currentCompany !== undefined) {
      mentor.currentCompany = updateMentorDto.currentCompany;
    }
    if (updateMentorDto.currentPosition !== undefined) {
      mentor.currentPosition = updateMentorDto.currentPosition;
    }
    if (updateMentorDto.educationBackground !== undefined) {
      mentor.educationBackground = updateMentorDto.educationBackground;
    }
    if (updateMentorDto.certifications !== undefined) {
      mentor.setCertifications(updateMentorDto.certifications);
    }
    if (updateMentorDto.hourlyRate !== undefined) {
      mentor.hourlyRate = updateMentorDto.hourlyRate;
    }
    if (updateMentorDto.availability !== undefined) {
      mentor.setAvailability(updateMentorDto.availability);
    }
    if (updateMentorDto.specializations !== undefined) {
      mentor.setSpecializations(updateMentorDto.specializations);
    }
    if (updateMentorDto.languagesSpoken !== undefined) {
      mentor.setLanguagesSpoken(updateMentorDto.languagesSpoken);
    }

    await this.mentorRepository.save(mentor);
    return this.getMentorProfile(mentorId);
  }

  async searchMentors(searchDto: MentorSearchDto) {
    const queryBuilder = this.mentorRepository.createQueryBuilder('mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile');

    // Apply filters
    if (searchDto.expertise) {
      queryBuilder.andWhere('mentor.expertiseAreas LIKE :expertise', {
        expertise: `%${searchDto.expertise}%`,
      });
    }

    if (searchDto.specialization) {
      queryBuilder.andWhere('mentor.specializations LIKE :specialization', {
        specialization: `%${searchDto.specialization}%`,
      });
    }

    if (searchDto.minRating) {
      queryBuilder.andWhere('mentor.rating >= :minRating', {
        minRating: searchDto.minRating,
      });
    }

    if (searchDto.maxHourlyRate) {
      queryBuilder.andWhere('mentor.hourlyRate <= :maxHourlyRate', {
        maxHourlyRate: searchDto.maxHourlyRate,
      });
    }

    if (searchDto.language) {
      queryBuilder.andWhere('mentor.languagesSpoken LIKE :language', {
        language: `%${searchDto.language}%`,
      });
    }

    // Apply pagination
    queryBuilder
      .take(searchDto.limit || 10)
      .skip(searchDto.offset || 0)
      .orderBy('mentor.rating', 'DESC')
      .addOrderBy('mentor.totalSessions', 'DESC');

    const [mentors, total] = await queryBuilder.getManyAndCount();

    return {
      mentors: mentors.map(mentor => ({
        id: mentor.id,
        userId: mentor.userId,
        user: {
          id: mentor.user?.id,
          username: mentor.user?.username,
          profile: {
            firstName: mentor.user?.profile?.firstName,
            lastName: mentor.user?.profile?.lastName,
            profilePicture: mentor.user?.profile?.profilePicture,
          },
        },
        expertiseAreas: mentor.getExpertiseAreas(),
        yearsOfExperience: mentor.yearsOfExperience,
        currentCompany: mentor.currentCompany,
        currentPosition: mentor.currentPosition,
        hourlyRate: mentor.hourlyRate,
        rating: mentor.rating,
        totalSessions: mentor.totalSessions,
        isVerified: mentor.isVerified,
        specializations: mentor.getSpecializations(),
        languagesSpoken: mentor.getLanguagesSpoken(),
      })),
      total,
      limit: searchDto.limit || 10,
      offset: searchDto.offset || 0,
      hasMore: (searchDto.offset || 0) + (searchDto.limit || 10) < total,
    };
  }

  // Booking Management
  async createBooking(studentId: string, createBookingDto: CreateBookingDto) {
    // Verify mentor exists
    const mentor = await this.mentorRepository.findOne({
      where: { id: createBookingDto.mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check for conflicting bookings
    const scheduledAt = new Date(createBookingDto.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + createBookingDto.durationMinutes * 60000);
    
    const conflictingBooking = await this.bookingRepository.findOne({
      where: {
        mentorId: createBookingDto.mentorId,
        scheduledAt: Between(
          new Date(scheduledAt.getTime() - 3600000), // 1 hour buffer
          new Date(endTime.getTime() + 3600000)
        ),
        status: In(['pending', 'confirmed']),
      },
    });

    if (conflictingBooking) {
      throw new ConflictException('Mentor is not available at the requested time');
    }

    const booking = this.bookingRepository.create({
      studentId,
      mentorId: createBookingDto.mentorId,
      title: createBookingDto.title,
      description: createBookingDto.description,
      scheduledAt,
      durationMinutes: createBookingDto.durationMinutes,
      notes: createBookingDto.notes,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);
    return this.getBooking(savedBooking.id);
  }

  async getBooking(bookingId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Get mentor and student information
    const [mentor, student] = await Promise.all([
      this.getMentorProfile(booking.mentorId),
      this.userRepository.findOne({
        where: { id: booking.studentId },
        relations: ['profile'],
      }),
    ]);

    return {
      id: booking.id,
      studentId: booking.studentId,
      mentorId: booking.mentorId,
      mentor,
      student: student ? {
        id: student.id,
        username: student.username,
        profile: student.profile,
      } : null,
      title: booking.title,
      description: booking.description,
      scheduledAt: booking.scheduledAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      meetingUrl: booking.meetingUrl,
      meetingId: booking.meetingId,
      notes: booking.notes,
      mentorNotes: booking.mentorNotes,
      rating: booking.rating,
      feedback: booking.feedback,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  async updateBooking(bookingId: string, userId: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user is either the student or mentor
    const mentor = await this.mentorRepository.findOne({
      where: { id: booking.mentorId },
    });

    if (booking.studentId !== userId && mentor?.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this booking');
    }

    // Update fields
    Object.keys(updateBookingDto).forEach(key => {
      if (updateBookingDto[key] !== undefined) {
        if (key === 'scheduledAt') {
          booking[key] = new Date(updateBookingDto[key]);
        } else {
          booking[key] = updateBookingDto[key];
        }
      }
    });

    await this.bookingRepository.save(booking);
    return this.getBooking(bookingId);
  }

  async getUserBookings(userId: string, searchDto: BookingSearchDto) {
    // Check if user is a mentor
    const mentor = await this.mentorRepository.findOne({
      where: { userId },
    });

    const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

    if (mentor) {
      // User is a mentor, get bookings where they are the mentor
      queryBuilder.where('booking.mentorId = :mentorId', { mentorId: mentor.id });
    } else {
      // User is a student, get bookings where they are the student
      queryBuilder.where('booking.studentId = :studentId', { studentId: userId });
    }

    // Apply filters
    if (searchDto.status) {
      queryBuilder.andWhere('booking.status = :status', { status: searchDto.status });
    }

    if (searchDto.fromDate) {
      queryBuilder.andWhere('booking.scheduledAt >= :fromDate', { fromDate: new Date(searchDto.fromDate) });
    }

    if (searchDto.toDate) {
      queryBuilder.andWhere('booking.scheduledAt <= :toDate', { toDate: new Date(searchDto.toDate) });
    }

    // Apply pagination
    queryBuilder
      .take(searchDto.limit || 10)
      .skip(searchDto.offset || 0)
      .orderBy('booking.scheduledAt', 'DESC');

    const [bookings, total] = await queryBuilder.getManyAndCount();

    const enrichedBookings = await Promise.all(
      bookings.map(booking => this.getBooking(booking.id))
    );

    return {
      bookings: enrichedBookings,
      total,
      limit: searchDto.limit || 10,
      offset: searchDto.offset || 0,
      hasMore: (searchDto.offset || 0) + (searchDto.limit || 10) < total,
    };
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user is either the student or mentor
    const mentor = await this.mentorRepository.findOne({
      where: { id: booking.mentorId },
    });

    if (booking.studentId !== userId && mentor?.userId !== userId) {
      throw new ForbiddenException('Not authorized to cancel this booking');
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    if (reason) {
      booking.mentorNotes = reason;
    }

    await this.bookingRepository.save(booking);
    return this.getBooking(bookingId);
  }

  // Analytics and Statistics
  async getMentorStats(mentorId: string) {
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const [totalBookings, completedSessions, avgRating] = await Promise.all([
      this.bookingRepository.count({ where: { mentorId } }),
      this.bookingRepository.count({ where: { mentorId, status: 'completed' } }),
      this.bookingRepository
        .createQueryBuilder('booking')
        .select('AVG(booking.rating)', 'avgRating')
        .where('booking.mentorId = :mentorId', { mentorId })
        .andWhere('booking.rating IS NOT NULL')
        .getRawOne(),
    ]);

    return {
      totalBookings,
      completedSessions,
      averageRating: avgRating?.avgRating || 0,
      totalEarnings: completedSessions * (mentor.hourlyRate || 0),
      responseRate: 95, // Mock for now
      onTimeRate: 98, // Mock for now
    };
  }
}