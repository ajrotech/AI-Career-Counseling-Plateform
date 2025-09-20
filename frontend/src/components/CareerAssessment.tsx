'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  category: string;
  question: string;
  type: 'multiple' | 'scale' | 'ranking';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

interface Assessment {
  answers: Record<number, any>;
  currentStep: number;
  totalSteps: number;
  timeStarted: Date;
  completed: boolean;
}

const CareerAssessment = () => {
  const [assessment, setAssessment] = useState<Assessment>({
    answers: {},
    currentStep: 0,
    totalSteps: 0,
    timeStarted: new Date(),
    completed: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const questions: Question[] = [
    {
      id: 1,
      category: "Work Environment",
      question: "What type of work environment motivates you most?",
      type: "multiple",
      options: [
        "Collaborative team settings with frequent interaction",
        "Independent work with minimal supervision",
        "Fast-paced, high-energy environments",
        "Structured, organized, and predictable settings",
        "Creative, flexible, and innovative spaces"
      ]
    },
    {
      id: 2,
      category: "Skills & Interests",
      question: "How much do you enjoy problem-solving and analytical thinking?",
      type: "scale",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Not at all", max: "Extremely" }
    },
    {
      id: 3,
      category: "Work-Life Balance",
      question: "Rate the importance of work-life balance in your career",
      type: "scale",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Not important", max: "Extremely important" }
    },
    {
      id: 4,
      category: "Leadership",
      question: "Which leadership scenario appeals to you most?",
      type: "multiple",
      options: [
        "Leading large teams and managing strategic initiatives",
        "Mentoring individuals and supporting their growth",
        "Being a subject matter expert others consult",
        "Working as an individual contributor without management duties",
        "Leading small, specialized project teams"
      ]
    },
    {
      id: 5,
      category: "Communication",
      question: "How comfortable are you with public speaking and presentations?",
      type: "scale",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Very uncomfortable", max: "Very comfortable" }
    },
    {
      id: 6,
      category: "Technology",
      question: "How do you feel about working with cutting-edge technology?",
      type: "multiple",
      options: [
        "I love being an early adopter of new technologies",
        "I'm interested but prefer proven, stable technologies",
        "I'm comfortable with technology but it's not my focus",
        "I prefer minimal technology involvement",
        "I want to be involved in developing new technologies"
      ]
    },
    {
      id: 7,
      category: "Risk & Stability",
      question: "Rate your comfort level with career uncertainty and risk",
      type: "scale",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Prefer high security", max: "Comfortable with high risk" }
    },
    {
      id: 8,
      category: "Impact & Purpose",
      question: "What type of impact is most meaningful to you?",
      type: "multiple",
      options: [
        "Making a difference in individual people's lives",
        "Contributing to large-scale societal changes",
        "Building innovative products or services",
        "Advancing scientific knowledge and research",
        "Creating economic value and business growth",
        "Preserving culture, arts, or environment"
      ]
    }
  ];

  useEffect(() => {
    setAssessment(prev => ({
      ...prev,
      totalSteps: questions.length
    }));
  }, []);

  const handleAnswer = (questionId: number, answer: any) => {
    setAssessment(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const nextQuestion = () => {
    if (assessment.currentStep < questions.length - 1) {
      setAssessment(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    } else {
      completeAssessment();
    }
  };

  const previousQuestion = () => {
    if (assessment.currentStep > 0) {
      setAssessment(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const completeAssessment = async () => {
    setIsLoading(true);
    
    // Simulate API call to process results
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAssessment(prev => ({
      ...prev,
      completed: true
    }));
    
    setIsLoading(false);
    setShowResults(true);
  };

  const calculateResults = () => {
    // Simplified career matching logic
    const careers = [
      {
        title: "Software Engineer",
        match: 92,
        description: "Design and develop software applications and systems",
        skills: ["Programming", "Problem Solving", "Technical Design"],
        salary: "$75,000 - $150,000",
        growth: "22% (Much faster than average)"
      },
      {
        title: "Product Manager",
        match: 88,
        description: "Guide product development from conception to launch",
        skills: ["Strategy", "Communication", "Leadership"],
        salary: "$85,000 - $160,000",
        growth: "19% (Much faster than average)"
      },
      {
        title: "UX Designer",
        match: 85,
        description: "Create intuitive and engaging user experiences",
        skills: ["Design Thinking", "User Research", "Prototyping"],
        salary: "$60,000 - $120,000",
        growth: "13% (Faster than average)"
      }
    ];
    
    return careers;
  };

  const currentQuestion = questions[assessment.currentStep];
  const progress = ((assessment.currentStep + 1) / questions.length) * 100;
  const canProceed = assessment.answers[currentQuestion?.id] !== undefined;

  if (showResults) {
    const results = calculateResults();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Career Assessment Results
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Based on your responses, we've identified careers that align with your interests, skills, and preferences.
            </p>
          </div>

          {/* Career Matches */}
          <div className="space-y-6 mb-12">
            {results.map((career, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{career.title}</h3>
                    <p className="text-gray-600 mb-3">{career.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">{career.match}%</div>
                    <div className="text-sm text-gray-500">Match</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {career.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Salary Range</h4>
                    <p className="text-gray-600">{career.salary}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Job Growth</h4>
                    <p className="text-gray-600">{career.growth}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Learn More
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Find Mentors
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h3>
            <p className="text-blue-100 mb-6">Connect with mentors, explore job opportunities, and start your career journey.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/mentorship')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Find Mentors
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Responses</h3>
          <p className="text-gray-600">Finding your perfect career matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Career Assessment</h1>
            <span className="text-sm text-gray-600">
              Question {assessment.currentStep + 1} of {questions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              {currentQuestion?.category}
            </span>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion?.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion?.type === 'multiple' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <label key={index} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={assessment.answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion?.type === 'scale' && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{currentQuestion.scaleLabels?.min}</span>
                  <span>{currentQuestion.scaleLabels?.max}</span>
                </div>
                <div className="flex justify-between items-center space-x-2">
                  {Array.from({ length: currentQuestion.scaleMax! - currentQuestion.scaleMin! + 1 }, (_, i) => {
                    const value = currentQuestion.scaleMin! + i;
                    return (
                      <label key={value} className="flex flex-col items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={value}
                          checked={assessment.answers[currentQuestion.id] === value}
                          onChange={(e) => handleAnswer(currentQuestion.id, parseInt(e.target.value))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mb-1"
                        />
                        <span className="text-sm text-gray-600">{value}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={assessment.currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              assessment.currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={!canProceed}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !canProceed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {assessment.currentStep === questions.length - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerAssessment;