import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../../entities/assessment.entity';
import { AssessmentQuestion } from '../../entities/assessment-question.entity';
import { AssessmentResult } from '../../entities/assessment-result.entity';
import { CreateAssessmentSubmissionDto } from './dto/create-assessment-submission.dto';
import { 
  Assessment as AssessmentInterface, 
  AssessmentQuestion as AssessmentQuestionInterface,
  AssessmentResultData 
} from './interfaces/assessment.interface';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(AssessmentQuestion)
    private questionRepository: Repository<AssessmentQuestion>,
    @InjectRepository(AssessmentResult)
    private resultRepository: Repository<AssessmentResult>,
  ) {}

  async getAvailableAssessments(): Promise<AssessmentInterface[]> {
    // Return a simplified assessment object compatible with frontend
    const defaultAssessment = {
      id: 'career-personality-assessment',
      title: 'Career Personality Assessment',
      description: 'Discover your ideal career path based on your personality, interests, and skills',
      type: 'personality',
      estimatedTime: 15,
      difficulty: 'easy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return [defaultAssessment];
  }

  async getAssessmentById(id: string): Promise<AssessmentInterface | null> {
    if (id === 'career-personality-assessment') {
      return {
        id: 'career-personality-assessment',
        title: 'Career Personality Assessment',
        description: 'Discover your ideal career path based on your personality, interests, and skills',
        type: 'personality',
        questions: this.getDefaultQuestions(),
        estimatedTime: 15,
        difficulty: 'easy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    // For database assessments, we would query here
    // return await this.assessmentRepository.findOne({ where: { id }, relations: ['questions'] });
    return null;
  }

  private getDefaultQuestions(): AssessmentQuestionInterface[] {
    return [
      {
        id: '1',
        question: 'What type of work environment motivates you most?',
        type: 'multiple-choice',
        options: [
          'Collaborative team settings with frequent interaction',
          'Independent work with minimal supervision',
          'Fast-paced, high-energy environments',
          'Structured, organized, and predictable settings',
          'Creative, flexible, and innovative spaces'
        ],
        required: true,
        category: 'Work Environment',
      },
      {
        id: '2',
        question: 'How much do you enjoy problem-solving and analytical thinking?',
        type: 'scale',
        scaleRange: { min: 1, max: 10, labels: ['Not at all', 'Extremely'] },
        required: true,
        category: 'Skills & Interests',
      },
      {
        id: '3',
        question: 'Rate the importance of work-life balance in your career',
        type: 'scale',
        scaleRange: { min: 1, max: 10, labels: ['Not important', 'Extremely important'] },
        required: true,
        category: 'Work-Life Balance',
      },
      {
        id: '4',
        question: 'Which leadership scenario appeals to you most?',
        type: 'multiple-choice',
        options: [
          'Leading large teams and managing strategic initiatives',
          'Mentoring individuals and supporting their growth',
          'Being a subject matter expert others consult',
          'Working as an individual contributor without management duties',
          'Leading small, specialized project teams'
        ],
        required: true,
        category: 'Leadership',
      },
      {
        id: '5',
        question: 'How comfortable are you with public speaking and presentations?',
        type: 'scale',
        scaleRange: { min: 1, max: 10, labels: ['Very uncomfortable', 'Very comfortable'] },
        required: true,
        category: 'Communication',
      },
      {
        id: '6',
        question: 'How do you feel about working with cutting-edge technology?',
        type: 'multiple-choice',
        options: [
          'I love being an early adopter of new technologies',
          'I\'m interested but prefer proven, stable technologies',
          'I\'m comfortable with technology but it\'s not my focus',
          'I prefer minimal technology involvement',
          'I want to be involved in developing new technologies'
        ],
        required: true,
        category: 'Technology',
      },
      {
        id: '7',
        question: 'Rate your comfort level with career uncertainty and risk',
        type: 'scale',
        scaleRange: { min: 1, max: 10, labels: ['Prefer high security', 'Comfortable with high risk'] },
        required: true,
        category: 'Risk & Stability',
      },
      {
        id: '8',
        question: 'What type of impact is most meaningful to you?',
        type: 'multiple-choice',
        options: [
          'Making a difference in individual people\'s lives',
          'Contributing to large-scale societal changes',
          'Building innovative products or services',
          'Advancing scientific knowledge and research',
          'Creating economic value and business growth',
          'Preserving culture, arts, or environment'
        ],
        required: true,
        category: 'Impact & Purpose',
      }
    ];
  }

  async submitAssessment(
    submissionDto: CreateAssessmentSubmissionDto,
    userId: string,
  ): Promise<AssessmentResultData> {
    // Create a simple assessment result compatible with frontend expectations
    const result = {
      id: `result_${Date.now()}`,
      assessmentId: submissionDto.assessmentId,
      userId: userId,
      score: 85, // Mock score
      completedAt: new Date().toISOString(),
      timeSpent: submissionDto.timeSpent,
      results: {
        categories: [
          { name: 'Technical Skills', score: 90, description: 'Strong technical aptitude' },
          { name: 'Leadership', score: 75, description: 'Good leadership potential' },
          { name: 'Communication', score: 85, description: 'Excellent communication skills' },
        ],
        recommendations: [
          'Consider roles in software engineering',
          'Explore technical leadership positions',
          'Look into product management opportunities',
        ],
        careerMatches: [
          {
            title: 'Software Engineer',
            matchPercentage: 92,
            description: 'Design and develop software applications and systems',
            requiredSkills: ['Programming', 'Problem Solving', 'Technical Design'],
            averageSalary: '$75,000 - $150,000',
          },
          {
            title: 'Product Manager',
            matchPercentage: 88,
            description: 'Guide product development from conception to launch',
            requiredSkills: ['Strategy', 'Communication', 'Leadership'],
            averageSalary: '$85,000 - $160,000',
          },
          {
            title: 'UX Designer',
            matchPercentage: 85,
            description: 'Create intuitive and engaging user experiences',
            requiredSkills: ['Design Thinking', 'User Research', 'Prototyping'],
            averageSalary: '$60,000 - $120,000',
          },
        ],
        personalityType: 'Analytical Problem Solver',
        strengths: ['Technical thinking', 'Problem solving', 'Attention to detail'],
        areasForImprovement: ['Team collaboration', 'Public speaking'],
      },
    };

    // In a real implementation, we would save to database:
    // const assessmentResult = this.resultRepository.create({
    //   userId,
    //   assessmentId: submissionDto.assessmentId,
    //   responses: JSON.stringify(submissionDto.responses),
    //   // ... other fields
    // });
    // return await this.resultRepository.save(assessmentResult);

    return result;
  }

  async getUserAssessmentHistory(userId: string): Promise<AssessmentResultData[]> {
    // Mock implementation - in real app, query database
    return [];
  }

  async getAssessmentResult(resultId: string, userId: string): Promise<AssessmentResultData | null> {
    // Mock implementation - in real app, query database
    return null;
  }
}