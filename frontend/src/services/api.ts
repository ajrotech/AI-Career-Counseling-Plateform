/**
 * API Service Layer for Career Counseling Platform
 * Handles all HTTP requests with error handling and type safety
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    console.log('🚀 [API SERVICE] Making HTTP request');
    console.log('🌐 [API SERVICE] URL:', `${this.baseURL}${endpoint}`);
    console.log('⚙️ [API SERVICE] Options:', options);
    
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = this.getAuthToken();
      console.log('🔑 [API SERVICE] Auth token:', token ? 'Present' : 'Not present');
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };
      console.log('📋 [API SERVICE] Final config:', config);

      console.log('🌐 [API SERVICE] Making fetch request...');
      const response = await fetch(url, config);
      console.log('📡 [API SERVICE] Response status:', response.status);
      console.log('📡 [API SERVICE] Response ok:', response.ok);
      
      if (!response.ok) {
        console.log('❌ [API SERVICE] Response not ok, parsing error...');
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.log('❌ [API SERVICE] Error data:', errorData);
        
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      console.log('✅ [API SERVICE] Parsing successful response...');
      const data = await response.json();
      console.log('📤 [API SERVICE] Response data:', data);
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ [API SERVICE] Request Error:', error);
      console.error('❌ [API SERVICE] Error stack:', error.stack);
      
      if (error instanceof ApiError) {
        console.log('⚠️ [API SERVICE] Known API error:', error.message);
        return { 
          success: false, 
          error: error.message,
          message: `API Error (${error.status}): ${error.message}`
        };
      }
      
      console.log('⚠️ [API SERVICE] Network or unknown error');
      return { 
        success: false, 
        error: 'Network error or server unavailable',
        message: 'Unable to connect to the server. Please check your connection.'
      };
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiService, type ApiResponse, type ApiError };