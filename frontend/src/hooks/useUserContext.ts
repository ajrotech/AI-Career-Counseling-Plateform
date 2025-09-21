import { useState, useEffect, useCallback } from 'react';
import userService from '../services/user';

export interface UserContext {
  profile: {
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
  } | null;
  assessmentResults: {
    personalityType?: string;
    careerMatches?: Array<{
      role: string;
      match: number;
      description: string;
    }>;
    skillGaps?: string[];
    recommendations?: string[];
    completedAt?: Date;
  } | null;
  preferences: {
    chatStyle?: 'formal' | 'casual' | 'technical';
    responseLength?: 'brief' | 'detailed' | 'comprehensive';
    focusAreas?: string[];
    language?: string;
  };
  progress: {
    completedAssessments: number;
    sessionCount: number;
    lastActivity?: Date;
    milestones?: string[];
  };
}

interface UseUserContextReturn {
  userContext: UserContext;
  isLoading: boolean;
  error: string | null;
  refreshContext: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserContext['preferences']>) => void;
  generateContextPrompt: () => string;
}

export const useUserContext = (): UseUserContextReturn => {
  const [userContext, setUserContext] = useState<UserContext>({
    profile: null,
    assessmentResults: null,
    preferences: {
      chatStyle: 'casual',
      responseLength: 'detailed',
      focusAreas: [],
      language: 'en'
    },
    progress: {
      completedAssessments: 0,
      sessionCount: 0
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async () => {
    try {
      const profile = await userService.getUserProfile();
      if (profile.success && profile.data) {
        setUserContext(prev => ({
          ...prev,
          profile: {
            id: profile.data.id,
            name: profile.data.name,
            email: profile.data.email,
            avatar: profile.data.avatar,
            phone: profile.data.phone,
            location: profile.data.location,
            bio: profile.data.bio,
            skills: profile.data.skills || [],
            interests: profile.data.interests || [],
            experience: profile.data.experience || [],
            education: profile.data.education || [],
            preferences: profile.data.preferences || {
              industries: [],
              workTypes: [],
              salaryRange: { min: 0, max: 0 },
              locations: [],
              remoteWork: false
            }
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  const loadAssessmentResults = useCallback(async () => {
    try {
      // Mock assessment results - replace with actual API call
      const mockResults = {
        personalityType: 'INTJ - The Architect',
        careerMatches: [
          { role: 'Software Engineer', match: 92, description: 'Strong analytical skills and technical aptitude' },
          { role: 'Data Scientist', match: 88, description: 'Excellent problem-solving and analytical thinking' },
          { role: 'Product Manager', match: 84, description: 'Strategic thinking and technical understanding' }
        ],
        skillGaps: ['Machine Learning', 'Advanced SQL', 'Team Leadership'],
        recommendations: [
          'Develop machine learning skills through online courses',
          'Practice advanced SQL queries and database optimization',
          'Seek leadership opportunities in current role'
        ],
        completedAt: new Date('2024-01-15')
      };
      
      setUserContext(prev => ({
        ...prev,
        assessmentResults: mockResults
      }));
    } catch (error) {
      console.error('Error loading assessment results:', error);
    }
  }, []);

  const loadUserPreferences = useCallback(() => {
    try {
      const savedPreferences = localStorage.getItem('user_chat_preferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        setUserContext(prev => ({
          ...prev,
          preferences: { ...prev.preferences, ...preferences }
        }));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  const loadUserProgress = useCallback(() => {
    try {
      const savedProgress = localStorage.getItem('user_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setUserContext(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            ...progress,
            lastActivity: progress.lastActivity ? new Date(progress.lastActivity) : undefined
          }
        }));
      } else {
        // Initialize progress tracking
        const initialProgress = {
          completedAssessments: 1, // Assume they completed at least one
          sessionCount: 0,
          lastActivity: new Date(),
          milestones: []
        };
        setUserContext(prev => ({ ...prev, progress: initialProgress }));
        localStorage.setItem('user_progress', JSON.stringify(initialProgress));
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }, []);

  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadUserProfile(),
        loadAssessmentResults(),
        loadUserPreferences(),
        loadUserProgress()
      ]);
    } catch (error) {
      setError('Failed to load user context');
      console.error('Error refreshing user context:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile, loadAssessmentResults, loadUserPreferences, loadUserProgress]);

  const updatePreferences = useCallback((newPreferences: Partial<UserContext['preferences']>) => {
    setUserContext(prev => {
      const updatedPreferences = { ...prev.preferences, ...newPreferences };
      
      // Save to localStorage
      try {
        localStorage.setItem('user_chat_preferences', JSON.stringify(updatedPreferences));
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
      
      return {
        ...prev,
        preferences: updatedPreferences
      };
    });
  }, []);

  const generateContextPrompt = useCallback((): string => {
    const { profile, assessmentResults, preferences } = userContext;
    
    let contextPrompt = 'User Context for Personalized Career Counseling:\\n\\n';
    
    if (profile) {
      contextPrompt += `Profile: ${profile.name}\\n`;
      if (profile.experience && profile.experience.length > 0) {
        const currentRole = profile.experience[0]; // Assume first is most recent
        contextPrompt += `Current Role: ${currentRole.title} at ${currentRole.company}\\n`;
      }
      if (profile.location) contextPrompt += `Location: ${profile.location}\\n`;
      if (profile.skills && profile.skills.length > 0) {
        contextPrompt += `Skills: ${profile.skills.join(', ')}\\n`;
      }
      if (profile.interests && profile.interests.length > 0) {
        contextPrompt += `Interests: ${profile.interests.join(', ')}\\n`;
      }
      if (profile.preferences.industries && profile.preferences.industries.length > 0) {
        contextPrompt += `Industry Preferences: ${profile.preferences.industries.join(', ')}\\n`;
      }
      if (profile.preferences.workTypes && profile.preferences.workTypes.length > 0) {
        contextPrompt += `Work Type Preferences: ${profile.preferences.workTypes.join(', ')}\\n`;
      }
    }
    
    if (assessmentResults) {
      if (assessmentResults.personalityType) {
        contextPrompt += `\\nPersonality Type: ${assessmentResults.personalityType}\\n`;
      }
      if (assessmentResults.careerMatches && assessmentResults.careerMatches.length > 0) {
        contextPrompt += `Top Career Matches: ${assessmentResults.careerMatches.slice(0, 3).map(m => `${m.role} (${m.match}%)`).join(', ')}\\n`;
      }
      if (assessmentResults.skillGaps && assessmentResults.skillGaps.length > 0) {
        contextPrompt += `Skill Development Areas: ${assessmentResults.skillGaps.join(', ')}\\n`;
      }
    }
    
    contextPrompt += `\\nPreferred Communication Style: ${preferences.chatStyle}\\n`;
    contextPrompt += `Preferred Response Length: ${preferences.responseLength}\\n`;
    
    if (preferences.focusAreas && preferences.focusAreas.length > 0) {
      contextPrompt += `Areas of Focus: ${preferences.focusAreas.join(', ')}\\n`;
    }
    
    contextPrompt += '\\nPlease provide personalized, relevant advice based on this context.';
    
    return contextPrompt;
  }, [userContext]);

  // Load initial context
  useEffect(() => {
    refreshContext();
  }, []);

  // Update session count and last activity
  useEffect(() => {
    const updateProgress = () => {
      setUserContext(prev => {
        const updatedProgress = {
          ...prev.progress,
          sessionCount: prev.progress.sessionCount + 1,
          lastActivity: new Date()
        };
        
        try {
          localStorage.setItem('user_progress', JSON.stringify(updatedProgress));
        } catch (error) {
          console.error('Error saving progress:', error);
        }
        
        return { ...prev, progress: updatedProgress };
      });
    };

    // Update progress on component mount (new session)
    updateProgress();
  }, []);

  return {
    userContext,
    isLoading,
    error,
    refreshContext,
    updatePreferences,
    generateContextPrompt
  };
};