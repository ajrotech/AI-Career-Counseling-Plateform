/**
 * Toast notification utilities
 * Centralized toast messages for consistent user feedback
 */

import toast from 'react-hot-toast';

export const showToast = {
  // Success messages
  success: (message: string, options?: any) => {
    return toast.success(message, {
      duration: 3000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
      ...options,
    });
  },

  // Error messages
  error: (message: string, options?: any) => {
    return toast.error(message, {
      duration: 5000,
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
      ...options,
    });
  },

  // Loading messages
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  },

  // Info messages
  info: (message: string, options?: any) => {
    return toast(message, {
      duration: 4000,
      style: {
        background: '#6366f1',
        color: '#fff',
        fontWeight: '500',
      },
      icon: 'ℹ️',
      ...options,
    });
  },

  // Warning messages
  warning: (message: string, options?: any) => {
    return toast(message, {
      duration: 4000,
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
      },
      icon: '⚠️',
      ...options,
    });
  },

  // Dismiss specific toast
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

// Pre-defined authentication messages
export const authToasts = {
  loginLoading: () => showToast.loading('Signing you in...', { id: 'auth-loading' }),
  loginSuccess: (userName?: string) => 
    showToast.success(
      `Welcome back${userName ? `, ${userName}` : ''}! 👋`, 
      { id: 'auth-loading' }
    ),
  loginError: (message: string) => 
    showToast.error(message, { id: 'auth-loading' }),

  registerLoading: () => showToast.loading('Creating your account...', { id: 'auth-loading' }),
  registerSuccess: (userName?: string) => 
    showToast.success(
      `Welcome to Career Counseling Platform${userName ? `, ${userName}` : ''}! 🎉`, 
      { id: 'auth-loading' }
    ),
  registerError: (message: string) => 
    showToast.error(message, { id: 'auth-loading' }),

  logoutSuccess: () => showToast.success('You have been signed out successfully', { duration: 2000 }),
  
  sessionExpired: () => showToast.warning('Your session has expired. Please sign in again.', { duration: 6000 }),
  
  unauthorizedAccess: () => showToast.error('Please sign in to access this feature', { duration: 4000 }),
};