import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  educationLevel?: string;
  interests?: string[];
  skills?: string[];
  careerGoals?: string[];
  experienceLevel?: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  score: number;
  completedAt: string;
  results: {
    categories: Array<{
      name: string;
      score: number;
      description: string;
    }>;
    recommendations: string[];
    careerMatches: Array<{
      title: string;
      matchPercentage: number;
      description: string;
    }>;
  };
}

export interface ChatContext {
  userProfile?: UserProfile;
  previousAssessments?: AssessmentResult[];
  currentGoals?: string[];
  contextPrompt?: string;
  assessmentResults?: AssessmentResult[];
  preferences?: any;
  currentPage?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  preferredProvider?: string;

  @IsOptional()
  context?: ChatContext;
}

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  context?: string;
}

export interface ChatMessageResponse {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  sessionId: string;
  createdAt: Date;
}

export interface ChatSessionResponse {
  id: string;
  title: string;
  context?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
  lastMessage?: ChatMessageResponse;
}