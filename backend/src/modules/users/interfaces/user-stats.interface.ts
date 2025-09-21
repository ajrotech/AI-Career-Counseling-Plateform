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
  totalTimeSpent: number;
  lastLoginAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  icon: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number; // percentage
  target: number;
  current: number;
  estimatedCompletion: string;
  category: string;
}

export interface DashboardData {
  stats: UserStats;
  achievements: Achievement[];
  nextMilestones: Milestone[];
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  upcomingSessions: Array<{
    id: string;
    mentorName: string;
    date: string;
    time: string;
    topic: string;
  }>;
  recommendations: string[];
}