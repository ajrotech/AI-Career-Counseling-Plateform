'use client';

import { useState } from 'react';
import Navigation from './Navigation';

interface DashboardStats {
  assessmentsCompleted: number;
  mentoringSessions: number;
  careerMatches: number;
  profileCompleteness: number;
}

interface Assessment {
  id: string;
  title: string;
  completedAt: string;
  score: number;
  recommendations: string[];
}

interface MentorSession {
  id: string;
  mentorName: string;
  date: string;
  duration: string;
  topic: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats: DashboardStats = {
    assessmentsCompleted: 3,
    mentoringSessions: 7,
    careerMatches: 12,
    profileCompleteness: 85,
  };

  const recentAssessments: Assessment[] = [
    {
      id: '1',
      title: 'Career Personality Assessment',
      completedAt: '2025-09-18',
      score: 92,
      recommendations: ['Software Engineer', 'Product Manager', 'UX Designer']
    },
    {
      id: '2',
      title: 'Skills & Interests Evaluation',
      completedAt: '2025-09-15',
      score: 88,
      recommendations: ['Data Scientist', 'Business Analyst', 'Consultant']
    },
    {
      id: '3',
      title: 'Work Style Preferences',
      completedAt: '2025-09-10',
      score: 95,
      recommendations: ['Remote Work', 'Startup Environment', 'Team Leadership']
    }
  ];

  const upcomingSessions: MentorSession[] = [
    {
      id: '1',
      mentorName: 'Sarah Chen',
      date: '2025-09-22',
      duration: '60 min',
      topic: 'Software Engineering Career Path',
      status: 'upcoming'
    },
    {
      id: '2',
      mentorName: 'Michael Rodriguez',
      date: '2025-09-25',
      duration: '45 min',
      topic: 'Product Management Skills',
      status: 'upcoming'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'assessments', name: 'Assessments', icon: '🎯' },
    { id: 'mentorship', name: 'Mentorship', icon: '👥' },
    { id: 'recommendations', name: 'Career Matches', icon: '💼' },
    { id: 'profile', name: 'Profile', icon: '⚙️' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assessmentsCompleted}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mentor Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.mentoringSessions}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Career Matches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.careerMatches}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">💼</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profile Complete</p>
              <p className="text-2xl font-bold text-gray-900">{stats.profileCompleteness}%</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⚙️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h3>
          <div className="space-y-4">
            {recentAssessments.slice(0, 2).map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{assessment.title}</p>
                  <p className="text-sm text-gray-600">Completed {assessment.completedAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{assessment.score}%</p>
                  <p className="text-xs text-gray-500">Match Score</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All Assessments →
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{session.mentorName}</p>
                  <p className="text-sm text-gray-600">{session.topic}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.date}</p>
                  <p className="text-xs text-gray-500">{session.duration}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-green-600 hover:text-green-700 font-medium text-sm">
            Book New Session →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors">
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-medium">Take Assessment</p>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <p className="font-medium">Find Mentor</p>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium">View Insights</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAssessments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Assessments</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Take New Assessment
        </button>
      </div>

      <div className="grid gap-6">
        {recentAssessments.map((assessment) => (
          <div key={assessment.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                <p className="text-sm text-gray-600">Completed on {assessment.completedAt}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{assessment.score}%</div>
                <div className="text-sm text-gray-500">Overall Match</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Top Recommendations:</h4>
              <div className="flex flex-wrap gap-2">
                {assessment.recommendations.map((rec, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {rec}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                View Details
              </button>
              <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                Retake Assessment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'assessments':
        return renderAssessments();
      case 'mentorship':
        return (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mentorship Center</h3>
            <p className="text-gray-600 mb-6">Connect with industry experts and accelerate your career growth.</p>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Browse Mentors
            </button>
          </div>
        );
      case 'recommendations':
        return (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Recommendations</h3>
            <p className="text-gray-600 mb-6">Discover career paths that match your skills and interests.</p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              View All Matches
            </button>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Settings</h3>
            <p className="text-gray-600 mb-6">Manage your account settings and preferences.</p>
            <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
              Edit Profile
            </button>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
          <p className="text-gray-600">Track your career development journey and discover new opportunities.</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;