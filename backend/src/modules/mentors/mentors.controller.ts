import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { MentorsService } from './mentors.service';
import { 
  CreateMentorProfileDto, 
  UpdateMentorProfileDto, 
  MentorSearchDto 
} from './dto/mentor.dto';
import { 
  CreateBookingDto, 
  UpdateBookingDto, 
  BookingSearchDto 
} from './dto/booking.dto';

@ApiTags('mentors')
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  // Mentor Profile Management
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create mentor profile' })
  @ApiResponse({ status: 201, description: 'Mentor profile created successfully' })
  @ApiResponse({ status: 409, description: 'User already has a mentor profile' })
  async createMentorProfile(
    @GetUser() user: User,
    @Body() createMentorDto: CreateMentorProfileDto,
  ) {
    return this.mentorsService.createMentorProfile(user.id, createMentorDto);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user mentor profile' })
  @ApiResponse({ status: 200, description: 'Mentor profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found' })
  async getMyMentorProfile(@GetUser() user: User) {
    return this.mentorsService.getMentorProfileByUserId(user.id);
  }

  @Put('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user mentor profile' })
  @ApiResponse({ status: 200, description: 'Mentor profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found' })
  async updateMyMentorProfile(
    @GetUser() user: User,
    @Body() updateMentorDto: UpdateMentorProfileDto,
  ) {
    const profile = await this.mentorsService.getMentorProfileByUserId(user.id);
    return this.mentorsService.updateMentorProfile(profile.id, user.id, updateMentorDto);
  }

  @Get('profile/:mentorId')
  @ApiOperation({ summary: 'Get mentor profile by ID' })
  @ApiResponse({ status: 200, description: 'Mentor profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found' })
  async getMentorProfile(@Param('mentorId') mentorId: string) {
    return this.mentorsService.getMentorProfile(mentorId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search mentors with filters' })
  @ApiResponse({ status: 200, description: 'Mentors retrieved successfully' })
  async searchMentors(@Query() searchDto: MentorSearchDto) {
    return this.mentorsService.searchMentors(searchDto);
  }

  @Get('stats/:mentorId')
  @ApiOperation({ summary: 'Get mentor statistics' })
  @ApiResponse({ status: 200, description: 'Mentor statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mentor not found' })
  async getMentorStats(@Param('mentorId') mentorId: string) {
    return this.mentorsService.getMentorStats(mentorId);
  }

  // Booking Management
  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 404, description: 'Mentor not found' })
  @ApiResponse({ status: 409, description: 'Mentor not available at requested time' })
  async createBooking(
    @GetUser() user: User,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.mentorsService.createBooking(user.id, createBookingDto);
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bookings (as student or mentor)' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async getUserBookings(
    @GetUser() user: User,
    @Query() searchDto: BookingSearchDto,
  ) {
    return this.mentorsService.getUserBookings(user.id, searchDto);
  }

  @Get('bookings/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking details' })
  @ApiResponse({ status: 200, description: 'Booking details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(@Param('bookingId') bookingId: string) {
    return this.mentorsService.getBooking(bookingId);
  }

  @Put('bookings/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking details' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this booking' })
  async updateBooking(
    @GetUser() user: User,
    @Param('bookingId') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.mentorsService.updateBooking(bookingId, user.id, updateBookingDto);
  }

  @Delete('bookings/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to cancel this booking' })
  async cancelBooking(
    @GetUser() user: User,
    @Param('bookingId') bookingId: string,
    @Body('reason') reason?: string,
  ) {
    return this.mentorsService.cancelBooking(bookingId, user.id, reason);
  }

  // Additional endpoints for mentor dashboard
  @Get('my-sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get mentor sessions (for mentor dashboard)' })
  @ApiResponse({ status: 200, description: 'Mentor sessions retrieved successfully' })
  async getMentorSessions(
    @GetUser() user: User,
    @Query() searchDto: BookingSearchDto,
  ) {
    // This endpoint is specifically for mentors to view their sessions
    return this.mentorsService.getUserBookings(user.id, searchDto);
  }

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current mentor statistics' })
  @ApiResponse({ status: 200, description: 'Mentor statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Mentor profile not found' })
  async getMyMentorStats(@GetUser() user: User) {
    const profile = await this.mentorsService.getMentorProfileByUserId(user.id);
    return this.mentorsService.getMentorStats(profile.id);
  }

  // Public endpoints for browsing mentors
  @Get('browse')
  @ApiOperation({ summary: 'Browse available mentors (public)' })
  @ApiResponse({ status: 200, description: 'Available mentors retrieved successfully' })
  async browseMentors(@Query() searchDto: MentorSearchDto) {
    // Set default filters for public browsing
    const publicSearchDto = {
      ...searchDto,
      limit: searchDto.limit || 20,
      offset: searchDto.offset || 0,
    };
    return this.mentorsService.searchMentors(publicSearchDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured mentors' })
  @ApiResponse({ status: 200, description: 'Featured mentors retrieved successfully' })
  async getFeaturedMentors() {
    // Get top-rated mentors with high session counts
    const searchDto: MentorSearchDto = {
      minRating: 4.5,
      limit: 6,
      offset: 0,
    };
    return this.mentorsService.searchMentors(searchDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get mentor categories and specializations' })
  @ApiResponse({ status: 200, description: 'Mentor categories retrieved successfully' })
  async getMentorCategories() {
    // Return available specializations and expertise areas
    return {
      specializations: [
        'SOFTWARE_ENGINEERING',
        'DATA_SCIENCE',
        'PRODUCT_MANAGEMENT',
        'DESIGN',
        'MARKETING',
        'BUSINESS_STRATEGY',
        'ENTREPRENEURSHIP',
        'FINANCE',
        'CONSULTING',
        'HEALTHCARE',
        'EDUCATION',
        'RESEARCH',
      ],
      expertiseAreas: [
        'Frontend Development',
        'Backend Development',
        'Full Stack Development',
        'Mobile Development',
        'DevOps',
        'Machine Learning',
        'Data Analysis',
        'UI/UX Design',
        'Digital Marketing',
        'Product Strategy',
        'Project Management',
        'Career Transition',
        'Interview Preparation',
        'Leadership',
        'Startup Advice',
      ],
      languages: [
        'English',
        'Spanish',
        'French',
        'German',
        'Chinese',
        'Japanese',
        'Hindi',
        'Arabic',
        'Portuguese',
        'Russian',
      ],
    };
  }
}