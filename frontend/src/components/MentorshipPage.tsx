'use client';

import { useState } from 'react';
import Navigation from './Navigation';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  expertise: string[];
  languages: string[];
  experience: string;
  hourlyRate: number;
  responseTime: string;
  availability: 'available' | 'busy' | 'offline';
  bio: string;
  location: string;
}

const MentorshipPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const categories = [
    'All Categories',
    'Software Engineering',
    'Product Management',
    'Data Science',
    'UX/UI Design',
    'Marketing',
    'Business Strategy',
    'Sales',
    'Finance'
  ];

  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      avatar: '👩‍💻',
      rating: 4.9,
      reviewCount: 124,
      expertise: ['JavaScript', 'React', 'Node.js', 'System Design'],
      languages: ['English', 'Mandarin'],
      experience: '8+ years',
      hourlyRate: 150,
      responseTime: '< 2 hours',
      availability: 'available',
      bio: 'I specialize in helping engineers advance their careers in tech. With 8+ years at Google, I can guide you through technical interviews, system design, and career progression.',
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      title: 'Product Manager',
      company: 'Meta',
      avatar: '👨‍💼',
      rating: 4.8,
      reviewCount: 87,
      expertise: ['Product Strategy', 'User Research', 'Data Analysis', 'Leadership'],
      languages: ['English', 'Spanish'],
      experience: '6+ years',
      hourlyRate: 120,
      responseTime: '< 3 hours',
      availability: 'available',
      bio: 'Former PM at Facebook and Uber. I help aspiring PMs break into tech and existing PMs level up their skills and impact.',
      location: 'New York, NY'
    },
    {
      id: '3',
      name: 'Dr. Emily Watson',
      title: 'Lead Data Scientist',
      company: 'Netflix',
      avatar: '👩‍🔬',
      rating: 4.9,
      reviewCount: 156,
      expertise: ['Machine Learning', 'Python', 'Statistics', 'AI Strategy'],
      languages: ['English'],
      experience: '10+ years',
      hourlyRate: 180,
      responseTime: '< 4 hours',
      availability: 'busy',
      bio: 'PhD in Machine Learning with experience at Netflix, Spotify, and Amazon. I mentor on ML engineering, research, and transitioning into data science.',
      location: 'Seattle, WA'
    },
    {
      id: '4',
      name: 'Alex Thompson',
      title: 'UX Design Director',
      company: 'Airbnb',
      avatar: '👨‍🎨',
      rating: 4.7,
      reviewCount: 203,
      expertise: ['UX Design', 'Design Systems', 'User Research', 'Team Leadership'],
      languages: ['English', 'French'],
      experience: '12+ years',
      hourlyRate: 140,
      responseTime: '< 6 hours',
      availability: 'available',
      bio: 'Design leader with experience at Airbnb, Apple, and IDEO. I help designers at all levels improve their craft and advance their careers.',
      location: 'Los Angeles, CA'
    },
    {
      id: '5',
      name: 'Jennifer Park',
      title: 'Marketing Director',
      company: 'Shopify',
      avatar: '👩‍📊',
      rating: 4.8,
      reviewCount: 91,
      expertise: ['Growth Marketing', 'Brand Strategy', 'Content Marketing', 'Analytics'],
      languages: ['English', 'Korean'],
      experience: '7+ years',
      hourlyRate: 110,
      responseTime: '< 4 hours',
      availability: 'available',
      bio: 'Growth marketing expert who scaled Shopify from startup to IPO. I help marketers develop data-driven strategies and build successful campaigns.',
      location: 'Toronto, Canada'
    },
    {
      id: '6',
      name: 'David Kumar',
      title: 'Investment Banker',
      company: 'Goldman Sachs',
      avatar: '👨‍💼',
      rating: 4.6,
      reviewCount: 67,
      expertise: ['Investment Banking', 'Financial Modeling', 'M&A', 'Career Strategy'],
      languages: ['English', 'Hindi'],
      experience: '9+ years',
      hourlyRate: 200,
      responseTime: '< 8 hours',
      availability: 'offline',
      bio: 'Senior banker with expertise in M&A and capital markets. I mentor on breaking into finance, interview prep, and career advancement in banking.',
      location: 'London, UK'
    }
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           mentor.expertise.some(skill => skill.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const MentorCard = ({ mentor }: { mentor: Mentor }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="text-4xl mr-4">{mentor.avatar}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
            <p className="text-gray-600">{mentor.title}</p>
            <p className="text-sm text-gray-500">{mentor.company}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
          {mentor.availability}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium text-gray-900 ml-1">{mentor.rating}</span>
            <span className="text-sm text-gray-500 ml-1">({mentor.reviewCount} reviews)</span>
          </div>
          <span className="text-sm text-gray-500 ml-4">{mentor.experience}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{mentor.bio}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">EXPERTISE</p>
        <div className="flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 4).map((skill, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {skill}
            </span>
          ))}
          {mentor.expertise.length > 4 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              +{mentor.expertise.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p><span className="font-medium">${mentor.hourlyRate}/hour</span></p>
          <p>Responds in {mentor.responseTime}</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setSelectedMentor(mentor)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            View Profile
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Book Session
          </button>
        </div>
      </div>
    </div>
  );

  const MentorModal = ({ mentor, onClose }: { mentor: Mentor; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="text-5xl mr-4">{mentor.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
                <p className="text-lg text-gray-600">{mentor.title}</p>
                <p className="text-gray-500">{mentor.company} • {mentor.location}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Rating & Reviews</h3>
              <div className="flex items-center mb-4">
                <span className="text-yellow-400 text-2xl">★</span>
                <span className="text-xl font-bold text-gray-900 ml-2">{mentor.rating}</span>
                <span className="text-gray-500 ml-2">({mentor.reviewCount} reviews)</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Session Details</h3>
              <p className="text-gray-600">Rate: <span className="font-medium">${mentor.hourlyRate}/hour</span></p>
              <p className="text-gray-600">Response: {mentor.responseTime}</p>
              <p className="text-gray-600">Experience: {mentor.experience}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600 leading-relaxed">{mentor.bio}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.languages.map((language, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {language}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              disabled={mentor.availability === 'offline'}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mentor.availability === 'offline'
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {mentor.availability === 'offline' ? 'Currently Unavailable' : 'Book 1-on-1 Session'}
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Mentor</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with industry experts who can guide your career journey and help you achieve your goals.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Mentors
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category, index) => (
                  <option key={index} value={index === 0 ? 'all' : category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                id="price"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="under-100">Under $100/hr</option>
                <option value="100-150">$100-150/hr</option>
                <option value="150-200">$150-200/hr</option>
                <option value="over-200">Over $200/hr</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all mentors.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange('all');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Mentor Detail Modal */}
      {selectedMentor && (
        <MentorModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
        />
      )}
    </div>
  );
};

export default MentorshipPage;