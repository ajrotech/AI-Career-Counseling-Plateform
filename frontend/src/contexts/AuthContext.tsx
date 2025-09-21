/**
 * Authentication Context and Provider
 * Manages user authentication state globally
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authAPI, { User, LoginCredentials, RegisterData } from '../services/auth';
import { useApiMutation } from '../hooks/useApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useApiMutation(authAPI.login);
  const registerMutation = useApiMutation(authAPI.register);
  const logoutMutation = useApiMutation(authAPI.logout);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          const response = await authAPI.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token might be invalid, clear it
            authAPI.clearAuthToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authAPI.clearAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    const response = await loginMutation.mutate(credentials);
    
    if (response.success && response.data) {
      setUser(response.data.user);
      return true;
    } else {
      setError(response.error || 'Login failed');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setError(null);
    
    // Basic validation
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    const response = await registerMutation.mutate(data);
    
    if (response.success && response.data) {
      setUser(response.data.user);
      return true;
    } else {
      setError(response.error || 'Registration failed');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    await logoutMutation.mutate({});
    setUser(null);
    authAPI.clearAuthToken();
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authAPI.isAuthenticated()) {
        const response = await authAPI.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.loading || registerMutation.loading,
    login,
    register,
    logout,
    refreshUser,
    error: error || loginMutation.error || registerMutation.error,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Authentication Required
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please log in to access this page.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}