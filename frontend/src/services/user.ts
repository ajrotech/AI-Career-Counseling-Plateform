/**
 * Dashboard and User Data API endpoints
 */

import apiService, { ApiResponse } from './api';

export interface UserStats {
  assessmentsCompleted: number;
  mentoringSessions: number;
  careerMatches: number;
  profileCompleteness: number;
  weeklyGrowth: {
    assessments: number;
    sessions: number;
    matches: number;
    profile: number;
  };
  streakDays: number;
  totalTimeSpent: number; // in minutes
  lastLoginAt: string;
}

export interface UserNotification {
  id: string;
  type: 'achievement' | 'mentor' | 'opportunity' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  preferences: {
    industries: string[];
    workTypes: string[];
    salaryRange: { min: number; max: number };
    locations: string[];
    remoteWork: boolean;
  };
  plan: 'free' | 'pro' | 'enterprise';
  planExpiresAt?: string;
}

export interface DashboardData {
  stats: UserStats;
  recentAssessments: Array<{
    id: string;
    title: string;
    score: number;
    completedAt: string;
    recommendations: string[];
    timeSpent: number;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
  }>;
  upcomingSessions: Array<{
    id: string;
    mentorName: string;
    topic: string;
    date: string;
    duration: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    meetingLink?: string;
  }>;
  notifications: UserNotification[];
  careerProgress: {
    currentGoals: Array<{
      id: string;
      title: string;
      description: string;
      progress: number;
      targetDate: string;
    }>;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      earnedAt: string;
      icon: string;
    }>;
  };
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  preferences?: Partial<UserProfile['preferences']>;
}

class UserAPI {
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return apiService.get<DashboardData>('/users/dashboard');
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiService.get<UserStats>('/users/stats');
  }

  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return apiService.get<UserProfile>('/users/profile');
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return apiService.put<UserProfile>('/users/profile', data);
  }

  async getNotifications(): Promise<ApiResponse<UserNotification[]>> {
    return apiService.get<UserNotification[]>('/users/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch<{ message: string }>(`/users/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch<{ message: string }>('/users/notifications/read-all');
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<{ message: string }>(`/users/notifications/${notificationId}`);
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiService.post<{ avatarUrl: string }>('/users/avatar', formData);
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch<{ message: string }>('/users/password', {
      currentPassword,
      newPassword
    });
  }

  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<{ message: string }>('/users/account');
  }

  async exportUserData(): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiService.get<{ downloadUrl: string }>('/users/export');
  }

  async getCareerGoals(): Promise<ApiResponse<DashboardData['careerProgress']['currentGoals']>> {
    return apiService.get<DashboardData['careerProgress']['currentGoals']>('/user/goals');
  }

  async createCareerGoal(goal: Omit<DashboardData['careerProgress']['currentGoals'][0], 'id' | 'progress'>): Promise<ApiResponse<DashboardData['careerProgress']['currentGoals'][0]>> {
    return apiService.post<DashboardData['careerProgress']['currentGoals'][0]>('/user/goals', goal);
  }

  async updateCareerGoal(goalId: string, updates: Partial<DashboardData['careerProgress']['currentGoals'][0]>): Promise<ApiResponse<DashboardData['careerProgress']['currentGoals'][0]>> {
    return apiService.patch<DashboardData['careerProgress']['currentGoals'][0]>(`/user/goals/${goalId}`, updates);
  }
}

export default new UserAPI();