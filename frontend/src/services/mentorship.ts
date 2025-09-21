/**
 * Mentorship API endpoints
 */

import apiService, { ApiResponse } from './api';

export interface MentorProfile {
  id: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    username: string;
    profile?: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  expertiseAreas: string[];
  yearsOfExperience: number;
  currentCompany?: string;
  currentPosition?: string;
  educationBackground?: string;
  certifications?: string[];
  hourlyRate: number;
  availability?: any;
  rating: number;
  totalSessions: number;
  isVerified: boolean;
  specializations?: string[];
  languagesSpoken: string[];
  calendarIntegration?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMentorProfileData {
  expertiseAreas: string[];
  yearsOfExperience: number;
  currentCompany?: string;
  currentPosition?: string;
  educationBackground?: string;
  certifications?: string[];
  hourlyRate: number;
  availability?: any;
  specializations?: string[];
  languagesSpoken?: string[];
}

export interface UpdateMentorProfileData {
  expertiseAreas?: string[];
  yearsOfExperience?: number;
  currentCompany?: string;
  currentPosition?: string;
  educationBackground?: string;
  certifications?: string[];
  hourlyRate?: number;
  availability?: any;
  specializations?: string[];
  languagesSpoken?: string[];
}

export interface MentorSearchFilters {
  expertise?: string;
  specialization?: string;
  minRating?: number;
  maxHourlyRate?: number;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface MentorSearchResponse {
  mentors: MentorProfile[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface Booking {
  id: string;
  studentId: string;
  mentorId: string;
  mentor?: MentorProfile;
  student?: {
    id: string;
    username: string;
    profile?: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingUrl?: string;
  meetingId?: string;
  notes?: string;
  mentorNotes?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  mentorId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
}

export interface UpdateBookingData {
  title?: string;
  description?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingUrl?: string;
  meetingId?: string;
  notes?: string;
  mentorNotes?: string;
  rating?: number;
  feedback?: string;
}

export interface BookingSearchFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface BookingSearchResponse {
  bookings: Booking[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface MentorStats {
  totalBookings: number;
  completedSessions: number;
  averageRating: number;
  totalEarnings: number;
  responseRate: number;
  onTimeRate: number;
}

export interface MentorCategories {
  specializations: string[];
  expertiseAreas: string[];
  languages: string[];
}

class MentorshipAPI {
  // Mentor Profile Management
  async createMentorProfile(data: CreateMentorProfileData): Promise<ApiResponse<MentorProfile>> {
    return apiService.post<MentorProfile>('/mentors/profile', data);
  }

  async getMyMentorProfile(): Promise<ApiResponse<MentorProfile>> {
    return apiService.get<MentorProfile>('/mentors/profile/me');
  }

  async updateMyMentorProfile(data: UpdateMentorProfileData): Promise<ApiResponse<MentorProfile>> {
    return apiService.put<MentorProfile>('/mentors/profile/me', data);
  }

  async getMentorProfile(mentorId: string): Promise<ApiResponse<MentorProfile>> {
    return apiService.get<MentorProfile>(`/mentors/profile/${mentorId}`);
  }

  async getMentorStats(mentorId: string): Promise<ApiResponse<MentorStats>> {
    return apiService.get<MentorStats>(`/mentors/stats/${mentorId}`);
  }

  async getMyMentorStats(): Promise<ApiResponse<MentorStats>> {
    return apiService.get<MentorStats>('/mentors/my-stats');
  }

  // Mentor Search and Discovery
  async searchMentors(filters: MentorSearchFilters = {}): Promise<ApiResponse<MentorSearchResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/mentors/search?${queryString}` : '/mentors/search';
    
    return apiService.get<MentorSearchResponse>(url);
  }

  async browseMentors(filters: MentorSearchFilters = {}): Promise<ApiResponse<MentorSearchResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/mentors/browse?${queryString}` : '/mentors/browse';
    
    return apiService.get<MentorSearchResponse>(url);
  }

  async getFeaturedMentors(): Promise<ApiResponse<MentorSearchResponse>> {
    return apiService.get<MentorSearchResponse>('/mentors/featured');
  }

  async getMentorCategories(): Promise<ApiResponse<MentorCategories>> {
    return apiService.get<MentorCategories>('/mentors/categories');
  }

  // Booking Management
  async createBooking(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>('/mentors/bookings', data);
  }

  async getBooking(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiService.get<Booking>(`/mentors/bookings/${bookingId}`);
  }

  async updateBooking(bookingId: string, data: UpdateBookingData): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/mentors/bookings/${bookingId}`, data);
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<ApiResponse<Booking>> {
    const body = reason ? { reason } : undefined;
    if (body) {
      return apiService.put<Booking>(`/mentors/bookings/${bookingId}`, { status: 'cancelled', mentorNotes: reason });
    } else {
      return apiService.delete<Booking>(`/mentors/bookings/${bookingId}`);
    }
  }

  async getUserBookings(filters: BookingSearchFilters = {}): Promise<ApiResponse<BookingSearchResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/mentors/bookings?${queryString}` : '/mentors/bookings';
    
    return apiService.get<BookingSearchResponse>(url);
  }

  async getMentorSessions(filters: BookingSearchFilters = {}): Promise<ApiResponse<BookingSearchResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/mentors/my-sessions?${queryString}` : '/mentors/my-sessions';
    
    return apiService.get<BookingSearchResponse>(url);
  }
}

const mentorshipAPI = new MentorshipAPI();
export default mentorshipAPI;