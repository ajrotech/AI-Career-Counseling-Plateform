'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AnalyticsEvent {
  eventType: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  pageUrl?: string;
  pageTitle?: string;
  properties?: Record<string, any>;
}

interface UseAnalyticsReturn {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (url?: string, title?: string) => void;
  trackButtonClick: (buttonName: string, location?: string) => void;
  trackFormSubmit: (formName: string, success?: boolean) => void;
  trackSearch: (query: string, results?: number) => void;
  startSession: () => Promise<string | null>;
  endSession: (sessionId: string) => void;
  updateActivity: (sessionId: string, pageUrl?: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useAnalytics(): UseAnalyticsReturn {
  const sessionId = useRef<string | null>(null);
  const activityTimer = useRef<NodeJS.Timeout | null>(null);

  // Track an analytics event
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...event,
          sessionId: sessionId.current,
          pageUrl: event.pageUrl || window.location.href,
          pageTitle: event.pageTitle || document.title,
        }),
      });
    } catch (error) {
      console.warn('Failed to track analytics event:', error);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((url?: string, title?: string) => {
    trackEvent({
      eventType: 'page_view',
      eventCategory: 'navigation',
      eventAction: 'page_view',
      pageUrl: url || window.location.href,
      pageTitle: title || document.title,
    });
  }, [trackEvent]);

  // Track button click
  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    trackEvent({
      eventType: 'button_click',
      eventCategory: 'engagement',
      eventAction: 'click',
      eventLabel: buttonName,
      properties: { location },
    });
  }, [trackEvent]);

  // Track form submission
  const trackFormSubmit = useCallback((formName: string, success?: boolean) => {
    trackEvent({
      eventType: 'form_submit',
      eventCategory: 'engagement',
      eventAction: success ? 'submit_success' : 'submit_attempt',
      eventLabel: formName,
      properties: { success },
    });
  }, [trackEvent]);

  // Track search
  const trackSearch = useCallback((query: string, results?: number) => {
    trackEvent({
      eventType: 'search',
      eventCategory: 'engagement',
      eventAction: 'search',
      eventLabel: query,
      eventValue: results,
      properties: { query, results },
    });
  }, [trackEvent]);

  // Start analytics session
  const startSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        sessionId.current = data.sessionId;
        
        // Set up periodic activity updates
        if (activityTimer.current) {
          clearInterval(activityTimer.current);
        }
        
        activityTimer.current = setInterval(() => {
          if (sessionId.current) {
            updateActivity(sessionId.current);
          }
        }, 30000); // Update every 30 seconds

        return data.sessionId;
      }
    } catch (error) {
      console.warn('Failed to start analytics session:', error);
    }
    return null;
  }, []);

  // End analytics session
  const endSession = useCallback(async (sessionIdToEnd: string) => {
    try {
      await fetch(`${API_BASE_URL}/analytics/session/${sessionIdToEnd}/end`, {
        method: 'POST',
        credentials: 'include',
      });

      if (activityTimer.current) {
        clearInterval(activityTimer.current);
        activityTimer.current = null;
      }

      sessionId.current = null;
    } catch (error) {
      console.warn('Failed to end analytics session:', error);
    }
  }, []);

  // Update session activity
  const updateActivity = useCallback(async (sessionIdToUpdate: string, pageUrl?: string) => {
    try {
      await fetch(`${API_BASE_URL}/analytics/session/${sessionIdToUpdate}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pageUrl: pageUrl || window.location.href,
        }),
      });
    } catch (error) {
      console.warn('Failed to update session activity:', error);
    }
  }, []);

  // Auto-start session on component mount
  useEffect(() => {
    const initSession = async () => {
      if (!sessionId.current) {
        await startSession();
        trackPageView();
      }
    };

    initSession();

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && sessionId.current) {
        updateActivity(sessionId.current);
      }
    };

    // Track before page unload
    const handleBeforeUnload = () => {
      if (sessionId.current) {
        updateActivity(sessionId.current);
        // Note: endSession might not complete due to page unload timing
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (activityTimer.current) {
        clearInterval(activityTimer.current);
      }
    };
  }, [startSession, trackPageView, updateActivity]);

  // Track route changes in Next.js
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url);
      if (sessionId.current) {
        updateActivity(sessionId.current, url);
      }
    };

    // Listen for route changes (Next.js specific)
    if (typeof window !== 'undefined' && window.history) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        setTimeout(() => handleRouteChange(window.location.href), 0);
      };

      window.history.replaceState = function(...args) {
        originalReplaceState.apply(window.history, args);
        setTimeout(() => handleRouteChange(window.location.href), 0);
      };

      window.addEventListener('popstate', () => {
        setTimeout(() => handleRouteChange(window.location.href), 0);
      });
    }
  }, [trackPageView, updateActivity]);

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    trackSearch,
    startSession,
    endSession,
    updateActivity,
  };
}