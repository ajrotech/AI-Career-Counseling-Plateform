/**
 * Authentication API endpoints
 */

import apiService, { ApiResponse } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthAPI {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      apiService.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      apiService.setAuthToken(response.data.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiService.post<{ message: string }>('/auth/logout');
    apiService.clearAuthToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiService.post<{ token: string }>('/auth/refresh');
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<{ message: string }>('/auth/reset-password', { token, password });
  }

  isAuthenticated(): boolean {
    return !!apiService['getAuthToken']();
  }

  clearAuthToken(): void {
    apiService.clearAuthToken();
  }

  setAuthToken(token: string): void {
    apiService.setAuthToken(token);
  }
}

export default new AuthAPI();