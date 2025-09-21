/**
 * Assessments API endpoints
 */

import apiService, { ApiResponse } from './api';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'personality' | 'skills' | 'interests' | 'values';
  questions: AssessmentQuestion[];
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'text' | 'boolean';
  options?: string[];
  scaleRange?: { min: number; max: number; labels?: string[] };
  required: boolean;
  category?: string;
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | number | string[];
}

export interface AssessmentSubmission {
  assessmentId: string;
  responses: AssessmentResponse[];
  timeSpent: number; // in seconds
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  completedAt: string;
  timeSpent: number;
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
      requiredSkills: string[];
      averageSalary?: string;
    }>;
    personalityType?: string;
    strengths: string[];
    areasForImprovement: string[];
  };
}

export interface UserAssessmentHistory {
  id: string;
  assessment: {
    id: string;
    title: string;
    type: string;
  };
  score: number;
  completedAt: string;
  timeSpent: number;
  result: AssessmentResult;
}

class AssessmentsAPI {
  async getAvailableAssessments(): Promise<ApiResponse<Assessment[]>> {
    return apiService.get<Assessment[]>('/assessments');
  }

  async getAssessmentById(id: string): Promise<ApiResponse<Assessment>> {
    return apiService.get<Assessment>(`/assessments/${id}`);
  }

  async submitAssessment(submission: AssessmentSubmission): Promise<ApiResponse<AssessmentResult>> {
    return apiService.post<AssessmentResult>('/assessments/submit', submission);
  }

  async getUserAssessmentHistory(): Promise<ApiResponse<UserAssessmentHistory[]>> {
    return apiService.get<UserAssessmentHistory[]>('/assessments/history');
  }

  async getAssessmentResult(resultId: string): Promise<ApiResponse<AssessmentResult>> {
    return apiService.get<AssessmentResult>(`/assessments/results/${resultId}`);
  }

  async retakeAssessment(assessmentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<{ message: string }>(`/assessments/${assessmentId}/retake`);
  }

  async saveAssessmentProgress(assessmentId: string, responses: AssessmentResponse[]): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<{ message: string }>(`/assessments/${assessmentId}/progress`, { responses });
  }

  async getAssessmentProgress(assessmentId: string): Promise<ApiResponse<{ responses: AssessmentResponse[] }>> {
    return apiService.get<{ responses: AssessmentResponse[] }>(`/assessments/${assessmentId}/progress`);
  }

  async getRecommendedAssessments(): Promise<ApiResponse<Assessment[]>> {
    return apiService.get<Assessment[]>('/assessments/recommended');
  }

  async getPopularAssessments(): Promise<ApiResponse<Assessment[]>> {
    return apiService.get<Assessment[]>('/assessments/popular');
  }
}

export default new AssessmentsAPI();