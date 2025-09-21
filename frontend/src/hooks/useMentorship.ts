/**
 * Custom hooks for mentorship functionality
 */

import { useState, useEffect, useCallback } from 'react';
import mentorshipAPI, {
  MentorProfile,
  MentorSearchFilters,
  MentorSearchResponse,
  Booking,
  CreateBookingData,
  UpdateBookingData,
  BookingSearchFilters,
  BookingSearchResponse,
  MentorStats,
  MentorCategories,
  CreateMentorProfileData,
  UpdateMentorProfileData,
} from '../services/mentorship';

// Hook for mentor search and discovery
export const useMentorSearch = () => {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const searchMentors = useCallback(async (filters: MentorSearchFilters = {}, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.searchMentors(filters);
      
      if (response.success && response.data) {
        if (append) {
          setMentors(prev => [...prev, ...response.data!.mentors]);
        } else {
          setMentors(response.data.mentors);
        }
        setHasMore(response.data.hasMore);
        setTotal(response.data.total);
      } else {
        setError(response.error || 'Failed to search mentors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (filters: MentorSearchFilters) => {
    if (!hasMore || loading) return;
    
    const newFilters = {
      ...filters,
      offset: mentors.length,
    };
    
    await searchMentors(newFilters, true);
  }, [mentors.length, hasMore, loading, searchMentors]);

  return {
    mentors,
    loading,
    error,
    hasMore,
    total,
    searchMentors,
    loadMore,
  };
};

// Hook for featured mentors
export const useFeaturedMentors = () => {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedMentors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await mentorshipAPI.getFeaturedMentors();
        
        if (response.success && response.data) {
          setMentors(response.data.mentors);
        } else {
          setError(response.error || 'Failed to fetch featured mentors');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMentors();
  }, []);

  return { mentors, loading, error };
};

// Hook for mentor categories
export const useMentorCategories = () => {
  const [categories, setCategories] = useState<MentorCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await mentorshipAPI.getMentorCategories();
        
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          setError(response.error || 'Failed to fetch categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Hook for mentor profile management
export const useMentorProfile = () => {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.getMyMentorProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to fetch mentor profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfile = useCallback(async (data: CreateMentorProfileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.createMentorProfile(data);
      
      if (response.success && response.data) {
        setProfile(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to create mentor profile');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateMentorProfileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.updateMyMentorProfile(data);
      
      if (response.success && response.data) {
        setProfile(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to update mentor profile');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
  };
};

// Hook for booking management
export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchBookings = useCallback(async (filters: BookingSearchFilters = {}, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.getUserBookings(filters);
      
      if (response.success && response.data) {
        if (append) {
          setBookings(prev => [...prev, ...response.data!.bookings]);
        } else {
          setBookings(response.data.bookings);
        }
        setHasMore(response.data.hasMore);
        setTotal(response.data.total);
      } else {
        setError(response.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data: CreateBookingData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.createBooking(data);
      
      if (response.success && response.data) {
        setBookings(prev => [response.data!, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to create booking');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (bookingId: string, data: UpdateBookingData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.updateBooking(bookingId, data);
      
      if (response.success && response.data) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId ? response.data! : booking
        ));
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to update booking');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await mentorshipAPI.cancelBooking(bookingId, reason);
      
      if (response.success && response.data) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId ? response.data! : booking
        ));
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to cancel booking');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    hasMore,
    total,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
  };
};

// Hook for mentor statistics
export const useMentorStats = (mentorId?: string) => {
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (id?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = id 
        ? await mentorshipAPI.getMentorStats(id)
        : await mentorshipAPI.getMyMentorStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch mentor stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mentorId !== undefined) {
      fetchStats(mentorId);
    }
  }, [mentorId, fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};