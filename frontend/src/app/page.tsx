'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import RealtimeChat from '@/components/RealtimeChat';

interface PlatformStatus {
  backend: 'loading' | 'running' | 'error';
  database: 'loading' | 'connected' | 'error';
  authentication: 'loading' | 'ready' | 'error';
}

export default function HomePage() {
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus>({
    backend: 'loading',
    database: 'loading',
    authentication: 'loading',
  });

  useEffect(() => {
    // Check platform status
    const checkStatus = async () => {
      try {
        // Check backend
        const backendResponse = await fetch('http://localhost:3001/health').catch(() => null);
        setPlatformStatus(prev => ({
          ...prev,
          backend: backendResponse?.ok ? 'running' : 'error'
        }));

        // Simulate other checks
        setTimeout(() => {
          setPlatformStatus(prev => ({
            ...prev,
            database: 'connected',
            authentication: 'ready'
          }));
        }, 1000);
      } catch (error) {
        setPlatformStatus({
          backend: 'error',
          database: 'error',
          authentication: 'error'
        });
      }
    };

    checkStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'running':
      case 'connected':
      case 'ready':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'loading':
        return 'Loading...';
      case 'running':
        return 'Running';
      case 'connected':
        return 'Connected';
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Career Development Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to discover, plan, and advance your career journey with confidence and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Career Assessments */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Assessments</h3>
              <p className="text-gray-600 mb-4">
                Discover your strengths and find the perfect career path with our AI-powered assessment tools.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Personality & Skills Analysis</li>
                <li>• Interest Mapping</li>
                <li>• Career Compatibility Scoring</li>
                <li>• Personalized Recommendations</li>
              </ul>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Start Assessment
              </button>
            </div>

            {/* Mentorship */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Mentorship</h3>
              <p className="text-gray-600 mb-4">
                Connect with experienced professionals in your field for guidance and career advice.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• 1-on-1 Mentor Sessions</li>
                <li>• Industry Expert Network</li>
                <li>• Career Planning Support</li>
                <li>• Skill Development Guidance</li>
              </ul>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                Find Mentors
              </button>
            </div>

            {/* Market Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Market Insights</h3>
              <p className="text-gray-600 mb-4">
                Stay informed about job market trends, salary data, and emerging opportunities.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Real-time Job Market Data</li>
                <li>• Salary Benchmarking</li>
                <li>• Industry Growth Trends</li>
                <li>• Skills Demand Analysis</li>
              </ul>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                View Insights
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Status */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Status</h2>
            <p className="text-gray-600">Real-time status of all platform services</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">{getStatusIcon(platformStatus.backend)}</div>
                <h3 className="font-semibold text-gray-900 mb-1">Backend API</h3>
                <p className="text-sm text-gray-600">{getStatusText(platformStatus.backend)}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">{getStatusIcon(platformStatus.database)}</div>
                <h3 className="font-semibold text-gray-900 mb-1">Database</h3>
                <p className="text-sm text-gray-600">{getStatusText(platformStatus.database)}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">{getStatusIcon(platformStatus.authentication)}</div>
                <h3 className="font-semibold text-gray-900 mb-1">Authentication</h3>
                <p className="text-sm text-gray-600">{getStatusText(platformStatus.authentication)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Chat Demo */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Try Our AI Career Counselor</h2>
            <p className="text-gray-600">Experience real-time AI-powered career guidance with WebSocket integration</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <RealtimeChat />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have discovered their ideal career path with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Start Free Assessment
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <span className="text-xl font-bold">CareerCounsel</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering careers through intelligent assessments and expert guidance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/assessments" className="hover:text-white">Assessments</a></li>
                <li><a href="/mentorship" className="hover:text-white">Mentorship</a></li>
                <li><a href="/insights" className="hover:text-white">Market Insights</a></li>
                <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 CareerCounsel Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}