/**
 * Authentication API endpoints
 */

import apiService, { ApiResponse } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

class AuthAPI {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    console.log('🔐 [AUTH SERVICE] Starting login process...');
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    console.log('📥 [AUTH SERVICE] Login response:', response);
    
    if (response.success && response.data) {
      console.log('✅ [AUTH SERVICE] Login successful, setting token...');
      console.log('🔑 [AUTH SERVICE] Access token received:', response.data.accessToken ? 'Yes' : 'No');
      console.log('🔑 [AUTH SERVICE] Token preview:', response.data.accessToken?.substring(0, 20) + '...');
      
      apiService.setAuthToken(response.data.accessToken);
      
      // Verify token was stored
      const storedToken = localStorage.getItem('auth_token');
      console.log('💾 [AUTH SERVICE] Token stored in localStorage:', storedToken ? 'Yes' : 'No');
      console.log('💾 [AUTH SERVICE] Stored token preview:', storedToken?.substring(0, 20) + '...');
    } else {
      console.log('❌ [AUTH SERVICE] Login failed:', response.error);
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    console.log('📝 [AUTH SERVICE] Starting registration process...');
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    
    console.log('📥 [AUTH SERVICE] Registration response:', response);
    
    if (response.success && response.data) {
      console.log('✅ [AUTH SERVICE] Registration successful, setting token...');
      console.log('🔑 [AUTH SERVICE] Access token received:', response.data.accessToken ? 'Yes' : 'No');
      console.log('🔑 [AUTH SERVICE] Token preview:', response.data.accessToken?.substring(0, 20) + '...');
      
      apiService.setAuthToken(response.data.accessToken);
      
      // Verify token was stored
      const storedToken = localStorage.getItem('auth_token');
      console.log('💾 [AUTH SERVICE] Token stored in localStorage:', storedToken ? 'Yes' : 'No');
      console.log('💾 [AUTH SERVICE] Stored token preview:', storedToken?.substring(0, 20) + '...');
    } else {
      console.log('❌ [AUTH SERVICE] Registration failed:', response.error);
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