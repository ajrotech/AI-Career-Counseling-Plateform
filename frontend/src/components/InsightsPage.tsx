'use client';

import { useState } from 'react';
import Navigation from './Navigation';

interface JobTrend {
  title: string;
  growth: number;
  averageSalary: number;
  openings: number;
  skills: string[];
  locations: string[];
}

interface SalaryData {
  role: string;
  junior: number;
  mid: number;
  senior: number;
}

const InsightsPage = () => {
  const [selectedTab, setSelectedTab] = useState('trends');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  const jobTrends: JobTrend[] = [
    {
      title: 'AI/Machine Learning Engineer',
      growth: 74,
      averageSalary: 142000,
      openings: 15420,
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning'],
      locations: ['San Francisco', 'New York', 'Seattle', 'Austin']
    },
    {
      title: 'DevOps Engineer',
      growth: 68,
      averageSalary: 118000,
      openings: 12830,
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      locations: ['Seattle', 'San Francisco', 'Denver', 'Boston']
    },
    {
      title: 'Product Manager',
      growth: 45,
      averageSalary: 125000,
      openings: 8950,
      skills: ['Strategy', 'Analytics', 'User Research', 'Roadmapping'],
      locations: ['San Francisco', 'New York', 'Los Angeles', 'Chicago']
    },
    {
      title: 'Cybersecurity Specialist',
      growth: 62,
      averageSalary: 108000,
      openings: 11200,
      skills: ['Security', 'Penetration Testing', 'Risk Assessment'],
      locations: ['Washington DC', 'New York', 'Boston', 'Dallas']
    },
    {
      title: 'Data Scientist',
      growth: 36,
      averageSalary: 115000,
      openings: 7640,
      skills: ['Python', 'R', 'SQL', 'Statistics', 'Visualization'],
      locations: ['San Francisco', 'New York', 'Seattle', 'Austin']
    }
  ];

  const salaryData: SalaryData[] = [
    { role: 'Software Engineer', junior: 85000, mid: 120000, senior: 165000 },
    { role: 'Product Manager', junior: 90000, mid: 125000, senior: 180000 },
    { role: 'Data Scientist', junior: 80000, mid: 115000, senior: 155000 },
    { role: 'UX Designer', junior: 70000, mid: 95000, senior: 130000 },
    { role: 'DevOps Engineer', junior: 75000, mid: 110000, senior: 150000 },
  ];

  const skillDemands = [
    { skill: 'Python', demand: 95, growth: '+12%' },
    { skill: 'JavaScript', demand: 92, growth: '+8%' },
    { skill: 'React', demand: 88, growth: '+15%' },
    { skill: 'AWS', demand: 85, growth: '+20%' },
    { skill: 'Docker', demand: 82, growth: '+25%' },
    { skill: 'Machine Learning', demand: 78, growth: '+35%' },
    { skill: 'Kubernetes', demand: 75, growth: '+30%' },
    { skill: 'Node.js', demand: 72, growth: '+10%' },
  ];

  const marketInsights = [
    {
      title: 'Remote Work Continues to Grow',
      description: 'Remote job postings increased by 42% this quarter, with 68% of companies offering hybrid options.',
      impact: 'positive',
      category: 'workplace'
    },
    {
      title: 'AI Skills in High Demand',
      description: 'Positions requiring AI/ML skills show 74% higher salary premiums compared to traditional roles.',
      impact: 'positive',
      category: 'skills'
    },
    {
      title: 'Cybersecurity Talent Shortage',
      description: 'The cybersecurity skills gap has widened, with 62% more open positions than available qualified candidates.',
      impact: 'opportunity',
      category: 'skills'
    },
    {
      title: 'Startup Hiring Rebounds',
      description: 'Startup job postings increased 28% this quarter after a challenging 2024, signaling recovery.',
      impact: 'positive',
      category: 'market'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'opportunity': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {jobTrends.map((trend, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{trend.title}</h3>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="text-green-600 font-medium">+{trend.growth}%</span>
                    <span className="ml-1">growth</span>
                  </span>
                  <span>{trend.openings.toLocaleString()} openings</span>
                  <span>${(trend.averageSalary / 1000).toFixed(0)}k avg salary</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">+{trend.growth}%</div>
                <div className="text-sm text-gray-500">6-month growth</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Top Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {trend.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Top Locations</h4>
                <div className="flex flex-wrap gap-2">
                  {trend.locations.map((location, locIndex) => (
                    <span key={locIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSalaries = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Salary Ranges by Experience Level</h3>
        <div className="space-y-4">
          {salaryData.map((data, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{data.role}</h4>
                <span className="text-sm text-gray-500">Annual Salary (USD)</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">${(data.junior / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-gray-600">Junior (0-2 years)</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-900">${(data.mid / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-blue-600">Mid-level (3-5 years)</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-900">${(data.senior / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-green-600">Senior (6+ years)</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Most In-Demand Skills</h3>
        <div className="space-y-4">
          {skillDemands.map((skill, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <span className="font-medium text-gray-900 w-32">{skill.skill}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${skill.demand}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{skill.demand}%</span>
              </div>
              <span className="text-sm font-medium text-green-600 ml-4 w-16 text-right">
                {skill.growth}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {marketInsights.map((insight, index) => (
          <div key={index} className={`rounded-xl p-6 border-2 ${getImpactColor(insight.impact)}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold">{insight.title}</h3>
              <span className="px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-50">
                {insight.category}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'trends', name: 'Job Trends', icon: '📈' },
    { id: 'salaries', name: 'Salary Data', icon: '💰' },
    { id: 'skills', name: 'Skills Demand', icon: '🎯' },
    { id: 'insights', name: 'Market Insights', icon: '💡' },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'trends': return renderTrends();
      case 'salaries': return renderSalaries();
      case 'skills': return renderSkills();
      case 'insights': return renderInsights();
      default: return renderTrends();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Market Insights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay ahead with real-time data on job trends, salary benchmarks, and skill demands across industries.
          </p>
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Time Period:</span>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedTab === tab.id
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

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Want Personalized Career Insights?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Take our career assessment to get customized recommendations based on current market trends and your unique profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Take Assessment
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Find Mentors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;