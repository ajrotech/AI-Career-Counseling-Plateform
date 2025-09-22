import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { AssessmentResult } from '../../entities/assessment-result.entity';
import { Booking } from '../../entities/booking.entity';
import { Notification } from '../../entities/notification.entity';
import { UserProgress } from '../../entities/user-progress.entity';
import { UpdateProfileDto } from './dto';
import { UserStats, Achievement, Milestone, DashboardData } from './interfaces/user-stats.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(AssessmentResult)
    private readonly assessmentResultRepository: Repository<AssessmentResult>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      profile: user.profile,
    };
  }

  async updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = user.profile;
    if (!profile) {
      // Create new profile with mapped fields
      profile = this.userProfileRepository.create({
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
        gender: updateProfileDto.gender,
        phoneNumber: updateProfileDto.phoneNumber,
        country: updateProfileDto.country,
        city: updateProfileDto.city,
        currentEducation: updateProfileDto.currentEducation,
        fieldOfStudy: updateProfileDto.fieldOfStudy,
        currentJobTitle: updateProfileDto.currentJobTitle,
        currentCompany: updateProfileDto.currentCompany,
        yearsOfExperience: updateProfileDto.yearsOfExperience,
        skills: updateProfileDto.skills ? JSON.stringify(updateProfileDto.skills) : undefined,
        interests: updateProfileDto.interests ? JSON.stringify(updateProfileDto.interests) : undefined,
        bio: updateProfileDto.bio,
        linkedinProfile: updateProfileDto.linkedinUrl,
        githubProfile: updateProfileDto.githubUrl,
        portfolioWebsite: updateProfileDto.portfolioUrl,
      });
      // profile.user = user; // Removed for MongoDB compatibility
    } else {
      // Update existing profile
      if (updateProfileDto.firstName !== undefined) profile.firstName = updateProfileDto.firstName;
      if (updateProfileDto.lastName !== undefined) profile.lastName = updateProfileDto.lastName;
      if (updateProfileDto.dateOfBirth !== undefined) profile.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
      if (updateProfileDto.gender !== undefined) profile.gender = updateProfileDto.gender;
      if (updateProfileDto.phoneNumber !== undefined) profile.phoneNumber = updateProfileDto.phoneNumber;
      if (updateProfileDto.country !== undefined) profile.country = updateProfileDto.country;
      if (updateProfileDto.city !== undefined) profile.city = updateProfileDto.city;
      if (updateProfileDto.currentEducation !== undefined) profile.currentEducation = updateProfileDto.currentEducation;
      if (updateProfileDto.fieldOfStudy !== undefined) profile.fieldOfStudy = updateProfileDto.fieldOfStudy;
      if (updateProfileDto.currentJobTitle !== undefined) profile.currentJobTitle = updateProfileDto.currentJobTitle;
      if (updateProfileDto.currentCompany !== undefined) profile.currentCompany = updateProfileDto.currentCompany;
      if (updateProfileDto.yearsOfExperience !== undefined) profile.yearsOfExperience = updateProfileDto.yearsOfExperience;
      if (updateProfileDto.skills !== undefined) profile.skills = JSON.stringify(updateProfileDto.skills);
      if (updateProfileDto.interests !== undefined) profile.interests = JSON.stringify(updateProfileDto.interests);
      if (updateProfileDto.bio !== undefined) profile.bio = updateProfileDto.bio;
      if (updateProfileDto.linkedinUrl !== undefined) profile.linkedinProfile = updateProfileDto.linkedinUrl;
      if (updateProfileDto.githubUrl !== undefined) profile.githubProfile = updateProfileDto.githubUrl;
      if (updateProfileDto.portfolioUrl !== undefined) profile.portfolioWebsite = updateProfileDto.portfolioUrl;
    }

    await this.userProfileRepository.save(profile);
    return await this.getUserProfile(userId);
  }

  async getUserStats(userId: string) {
    // Get assessment count
    const assessmentsCompleted = await this.assessmentResultRepository.count({
      where: { userId },
    });

    // Get booking count - using studentId since that's what Booking entity uses
    const mentoringSessions = await this.bookingRepository.count({
      where: { studentId: userId },
    });

    // Get career matches (mock for now, can be calculated from assessment results)
    const careerMatches = assessmentsCompleted > 0 ? 15 : 0;

    // Get profile completeness
    const userProfile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    const profileCompleteness = userProfile ? this.calculateProfileCompleteness(userProfile) : 0;

    // Calculate weekly growth (mock data for now)
    const weeklyGrowth = {
      assessments: 2,
      sessions: 1,
      matches: 3,
      profile: 10,
    };

    const streakDays = 7; // Mock data
    const totalTimeSpent = assessmentsCompleted * 30; // Estimate 30 min per assessment

    const user = await this.userRepository.findOne({ where: { id: userId } });

    return {
      assessmentsCompleted,
      mentoringSessions,
      careerMatches,
      profileCompleteness,
      weeklyGrowth,
      streakDays,
      totalTimeSpent,
      lastLoginAt: user?.lastLoginAt || new Date(),
    };
  }

  async getDashboardData(userId: string) {
    const stats = await this.getUserStats(userId);
    
    // Get recent assessments with actual data
    const recentAssessments = await this.assessmentResultRepository.find({
      where: { userId },
      order: { completedAt: 'DESC' },
      take: 5,
    });

    // Get recent bookings - using studentId since that's what Booking entity uses
    const recentBookings = await this.bookingRepository.find({
      where: { studentId: userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Get upcoming bookings
    const upcomingBookings = await this.bookingRepository.find({
      where: { 
        studentId: userId,
        status: 'confirmed',
        scheduledAt: { $gte: new Date() } as any // Future dates only
      },
      order: { scheduledAt: 'ASC' },
      take: 5,
    });

    // Get notifications
    const notifications = await this.getUserNotifications(userId, 10, 0);

    // Transform recent assessments with rich data
    const enrichedAssessments = recentAssessments.map(assessment => {
      let recommendations = [];
      let score = 0;
      
      try {
        if (assessment.recommendations) {
          recommendations = typeof assessment.recommendations === 'string' ? 
            JSON.parse(assessment.recommendations) : assessment.recommendations;
        }
        score = assessment.percentageScore || assessment.rawScore || 85;
      } catch (e) {
        console.warn('Error parsing assessment data:', e);
      }

      return {
        id: assessment.id,
        title: 'Career Personality Assessment', // Could be enhanced to fetch from Assessment entity
        score: score,
        completedAt: assessment.completedAt,
        recommendations: Array.isArray(recommendations) ? recommendations.slice(0, 3) : [],
        timeSpent: assessment.timeTakenMinutes || 30, // in minutes
        difficulty: 'medium' as const,
        category: 'personality',
      };
    });

    // Transform bookings to session format
    const recentSessions = recentBookings.map(booking => ({
      id: booking.id,
      mentorName: 'Professional Mentor', // Would need to join with Mentor entity for real name
      topic: booking.title || booking.description || 'Career Guidance',
      date: booking.scheduledAt,
      duration: `${booking.durationMinutes || 60} min`,
      status: booking.status as 'confirmed' | 'pending' | 'cancelled',
      meetingLink: booking.meetingUrl,
    }));

    // Transform upcoming bookings
    const upcomingSessions = upcomingBookings.map(booking => ({
      id: booking.id,
      mentorName: 'Professional Mentor', // Would need to join with Mentor entity for real name
      topic: booking.title || booking.description || 'Career Guidance',
      date: booking.scheduledAt,
      duration: `${booking.durationMinutes || 60} min`,
      status: booking.status as 'confirmed' | 'pending' | 'cancelled',
      meetingLink: booking.meetingUrl,
    }));

    // Create career progress data based on user activity
    const careerProgress = {
      currentGoals: [
        {
          id: '1',
          title: 'Complete Career Assessment',
          description: 'Take comprehensive personality and skills assessment',
          progress: stats.assessmentsCompleted > 0 ? 100 : 0,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Schedule Mentor Session',
          description: 'Connect with a career mentor for guidance',
          progress: stats.mentoringSessions > 0 ? 100 : 25,
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          title: 'Build Professional Profile',
          description: 'Complete your profile to improve career matches',
          progress: stats.profileCompleteness,
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      achievements: this.getAchievements(stats),
      nextMilestones: this.getNextMilestones(stats),
    };

    return {
      stats,
      recentAssessments: enrichedAssessments,
      upcomingSessions,
      notifications: notifications.notifications,
      careerProgress,
      recentActivity: [
        ...enrichedAssessments.map(a => ({
          type: 'assessment',
          title: `Completed ${a.title}`,
          timestamp: a.completedAt,
          score: a.score,
        })),
        ...recentSessions.map(s => ({
          type: 'session',
          title: `Session with ${s.mentorName}`,
          timestamp: s.date,
          topic: s.topic,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10),
    };
  }

  private getAchievements(stats: UserStats): Achievement[] {
    const achievements = [];
    
    if (stats.assessmentsCompleted >= 1) {
      achievements.push({
        id: 'first_assessment',
        title: 'Assessment Pioneer',
        description: 'Completed your first career assessment',
        earnedAt: new Date().toISOString(),
        icon: '🎯',
      });
    }
    
    if (stats.mentoringSessions >= 1) {
      achievements.push({
        id: 'first_session',
        title: 'Mentorship Starter',
        description: 'Had your first mentoring session',
        earnedAt: new Date().toISOString(),
        icon: '👥',
      });
    }
    
    if (stats.profileCompleteness >= 80) {
      achievements.push({
        id: 'profile_complete',
        title: 'Profile Master',
        description: 'Completed 80% of your profile',
        earnedAt: new Date().toISOString(),
        icon: '⭐',
      });
    }
    
    return achievements;
  }

  private getNextMilestones(stats: UserStats): Milestone[] {
    const milestones = [];
    
    if (stats.assessmentsCompleted === 0) {
      milestones.push({
        id: 'first_assessment',
        title: 'Take Your First Assessment',
        description: 'Complete a career personality assessment to get personalized recommendations',
        progress: 0,
        requirement: 1,
      });
    }
    
    if (stats.assessmentsCompleted < 3) {
      milestones.push({
        id: 'multiple_assessments',
        title: 'Assessment Expert',
        description: 'Complete 3 different assessments for comprehensive insights',
        progress: stats.assessmentsCompleted,
        requirement: 3,
      });
    }
    
    if (stats.mentoringSessions === 0) {
      milestones.push({
        id: 'first_mentor',
        title: 'Connect with a Mentor',
        description: 'Schedule your first mentoring session',
        progress: 0,
        requirement: 1,
      });
    }
    
    return milestones;
  }

  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, status: 'unread' },
    });

    return {
      notifications,
      total,
      unreadCount,
      hasMore: offset + limit < total,
    };
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = 'read';
    await this.notificationRepository.save(notification);
  }

  async getUserProgress(userId: string) {
    const progress = await this.userProgressRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    // Return mock progress for now since we need to check UserProgress entity structure
    return [{
      id: '1',
      userId,
      skillProgress: '{}',
      learningPath: '[]',
      achievements: '[]',
      goals: '[]',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // For now, return a mock URL since we need to set up file handling properly
    const avatarUrl = `/uploads/avatars/${userId}-${Date.now()}.jpg`;

    // Update user profile with avatar URL
    const userProfile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (userProfile) {
      // Note: Need to check if avatar field exists in entity
      await this.userProfileRepository.save(userProfile);
    }

    return avatarUrl;
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by setting deletedAt timestamp
    user.deletedAt = new Date();
    user.isActive = false;
    await this.userRepository.save(user);
  }

  private calculateProfileCompleteness(profile: UserProfile): number {
    const fields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'phoneNumber',
      'country',
      'city',
      'currentEducation',
      'fieldOfStudy',
      'currentJobTitle',
      'bio',
    ];

    const completedFields = fields.filter(field => {
      const value = profile[field];
      return value !== null && value !== undefined && value !== '';
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  }
}