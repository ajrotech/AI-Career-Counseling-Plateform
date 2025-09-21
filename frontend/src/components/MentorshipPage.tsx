'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { useMentorSearch, useFeaturedMentors, useMentorCategories, useBookings } from '../hooks/useMentorship';
import { MentorProfile, CreateBookingData, MentorSearchFilters } from '../services/mentorship';

// Component for individual mentor card
const MentorCard = ({ mentor, onBook, onViewProfile }: {
  mentor: MentorProfile;
  onBook: () => void;
  onViewProfile: () => void;
}) => {
  const formatMentorName = (mentor: MentorProfile) => {
    if (mentor.user?.profile) {
      return `${mentor.user.profile.firstName} ${mentor.user.profile.lastName}`;
    }
    return mentor.user?.username || 'Anonymous Mentor';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <span className="text-2xl">👨‍💼</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{formatMentorName(mentor)}</h3>
            <p className="text-sm text-gray-600">{mentor.currentPosition || 'Professional Mentor'}</p>
            <p className="text-sm text-gray-500">{mentor.currentCompany || 'Freelance'}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">4.8 (50 reviews)</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Expertise:</p>
        <div className="flex flex-wrap gap-1">
          {mentor.specializations?.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {skill}
            </span>
          )) || (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {mentor.expertiseAreas?.[0] || 'General Mentoring'}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <p>{mentor.yearsOfExperience} years experience</p>
          <p>Responds quickly</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${mentor.hourlyRate}</p>
          <p className="text-sm text-gray-600">per hour</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewProfile}
          className="flex-1 bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          View Profile
        </button>
        <button 
          onClick={onBook}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Book Session
        </button>
      </div>
    </div>
  );
};

// Component for mentor profile modal
const MentorProfileModal = ({ mentor, onClose, onBook }: {
  mentor: MentorProfile;
  onClose: () => void;
  onBook: () => void;
}) => {
  const formatMentorName = (mentor: MentorProfile) => {
    if (mentor.user?.profile) {
      return `${mentor.user.profile.firstName} ${mentor.user.profile.lastName}`;
    }
    return mentor.user?.username || 'Anonymous Mentor';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-6">
                <span className="text-3xl">👨‍💼</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formatMentorName(mentor)}</h2>
                <p className="text-lg text-gray-600">{mentor.currentPosition || 'Professional Mentor'}</p>
                <p className="text-gray-500">{mentor.currentCompany || 'Freelance'}</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">4.8 (50 reviews)</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700">{mentor.educationBackground || 'Experienced professional mentor with proven track record in career development.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.specializations?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                )) || (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {mentor.expertiseAreas?.[0] || 'General Mentoring'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
              <p className="text-gray-700">{mentor.yearsOfExperience} years of professional experience</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">${mentor.hourlyRate}</p>
              <p className="text-sm text-gray-600">per hour</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">&lt; 2 hours</p>
              <p className="text-sm text-gray-600">response time</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={onBook}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MentorshipPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxHourlyRate, setMaxHourlyRate] = useState<number | undefined>();
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);

  // Hooks for API data
  const { mentors, loading: searchLoading, error: searchError, searchMentors } = useMentorSearch();
  const { mentors: featuredMentors, loading: featuredLoading } = useFeaturedMentors();
  const { categories, loading: categoriesLoading } = useMentorCategories();
  const { createBooking, loading: bookingLoading } = useBookings();

  // Search filters
  const searchFilters: MentorSearchFilters = {
    expertise: searchQuery || undefined,
    specialization: selectedCategory || undefined,
    maxHourlyRate: maxHourlyRate,
    limit: 20,
    offset: 0,
  };

  // Trigger search when filters change
  useEffect(() => {
    searchMentors(searchFilters);
  }, [searchQuery, selectedCategory, maxHourlyRate, searchMentors]);

  const handleBookMentor = async (mentorId: string) => {
    // Simple booking creation - in a real app, you'd have a more detailed form
    const bookingData: CreateBookingData = {
      mentorId,
      title: 'Mentorship Session',
      description: 'Scheduled mentorship session',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      durationMinutes: 60,
      notes: 'Looking forward to learning from you!',
    };

    const result = await createBooking(bookingData);
    if (result.success) {
      alert('Booking created successfully!');
    } else {
      alert(`Failed to create booking: ${result.error}`);
    }
  };

  const priceRanges = [
    { label: 'All Prices', value: undefined },
    { label: 'Under $50', value: 50 },
    { label: 'Under $100', value: 100 },
    { label: 'Under $150', value: 150 },
    { label: 'Under $200', value: 200 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Mentor</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with industry experts who can guide your career journey. Get personalized advice, 
            skill development, and insights from professionals who've been where you want to go.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Expertise
              </label>
              <input
                type="text"
                placeholder="e.g., React, Product Management, Data Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={categoriesLoading}
              >
                <option value="">All Categories</option>
                {categories.specializations?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Hourly Rate
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={maxHourlyRate || ''}
                onChange={(e) => setMaxHourlyRate(e.target.value ? Number(e.target.value) : undefined)}
              >
                {priceRanges.map((range) => (
                  <option key={range.label} value={range.value || ''}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Mentors */}
        {!searchQuery && !selectedCategory && !maxHourlyRate && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Mentors</h2>
            {featuredLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading featured mentors...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredMentors.slice(0, 6).map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onBook={() => handleBookMentor(mentor.id)}
                    onViewProfile={() => setSelectedMentor(mentor)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery || selectedCategory || maxHourlyRate ? 'Search Results' : 'All Mentors'}
            </h2>
            <span className="text-gray-600">
              {searchLoading ? 'Searching...' : `${mentors.length} mentors found`}
            </span>
          </div>
          
          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error loading mentors: {searchError}</p>
            </div>
          )}

          {searchLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for mentors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onBook={() => handleBookMentor(mentor.id)}
                  onViewProfile={() => setSelectedMentor(mentor)}
                />
              ))}
              {mentors.length === 0 && !searchLoading && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No mentors found matching your criteria.</p>
                  <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mentor Profile Modal */}
        {selectedMentor && (
          <MentorProfileModal
            mentor={selectedMentor}
            onClose={() => setSelectedMentor(null)}
            onBook={() => {
              setSelectedMentor(null);
              handleBookMentor(selectedMentor.id);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MentorshipPage;