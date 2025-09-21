export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'text' | 'boolean';
  options?: string[];
  scaleRange?: {
    min: number;
    max: number;
    labels: [string, string]; // [minLabel, maxLabel]
  };
  required: boolean;
  category: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  questions?: AssessmentQuestion[];
  estimatedTime: number;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerMatch {
  title: string;
  matchPercentage: number;
  description: string;
  requiredSkills: string[];
  averageSalary: string;
}

export interface AssessmentCategory {
  name: string;
  score: number;
  description: string;
}

export interface AssessmentResultData {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  completedAt: string;
  timeSpent: number;
  results: {
    categories: AssessmentCategory[];
    recommendations: string[];
    careerMatches: CareerMatch[];
    personalityType: string;
    strengths: string[];
    areasForImprovement: string[];
  };
}