/**
 * Custom React hooks for API state management
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../services/api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  immediate: boolean = true
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || response.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error or server unavailable');
      console.error('API Hook Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset
  };
}

export interface UseApiMutationState<T, P = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (params: P) => Promise<ApiResponse<T>>;
  reset: () => void;
}

export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>
): UseApiMutationState<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(params);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || response.message || 'An error occurred');
      }
      
      return response;
    } catch (err) {
      const errorMessage = 'Network error or server unavailable';
      setError(errorMessage);
      console.error('API Mutation Error:', err);
      
      return {
        success: false,
        error: errorMessage,
        message: 'Unable to complete the request'
      };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset
  };
}

// Utility hook for managing multiple API states
export function useApiState<T>(initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setApiState = useCallback((response: ApiResponse<T>, isLoading: boolean = false) => {
    setLoading(isLoading);
    
    if (response.success && response.data) {
      setData(response.data);
      setError(null);
    } else {
      setError(response.error || response.message || 'An error occurred');
    }
  }, []);

  const resetState = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    setApiState,
    reset: resetState
  };
}

// Hook for handling form submissions with API calls
export function useFormSubmission<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (formData: P): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(formData);
      
      if (response.success && response.data) {
        onSuccess?.(response.data);
        return true;
      } else {
        const errorMessage = response.error || response.message || 'Submission failed';
        setError(errorMessage);
        onError?.(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = 'Network error or server unavailable';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Form Submission Error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    submit,
    clearError
  };
}

// Hook for real-time data with polling
export function usePolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 30000, // 30 seconds default
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.error || response.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error or server unavailable');
      console.error('Polling Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setLoading(true);
    setError(null);
  }, []);

  useEffect(() => {
    fetchData(); // Initial fetch
    
    const intervalId = setInterval(fetchData, interval);
    
    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset
  };
}