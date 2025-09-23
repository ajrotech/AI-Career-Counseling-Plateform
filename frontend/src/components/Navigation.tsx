'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeProvider';
import { 
  Home, 
  Brain, 
  MessageCircle, 
  Target, 
  Users, 
  BarChart3, 
  TrendingUp,
  Rocket,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  Calendar,
  BookOpen,
  Briefcase,
  ChevronRight,
  Award,
  CreditCard
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  initials: string;
  plan: 'free' | 'pro' | 'enterprise';
  notifications: number;
  completedAssessments: number;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic user state simulation
  useEffect(() => {
    const checkUserAuth = () => {
      // Simulate checking authentication state
      const loggedIn = Math.random() > 0.4; // 60% chance of being logged in for demo
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        // Simulate user profile data
        setUserProfile({
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          avatar: '/api/placeholder/40/40',
          initials: 'AJ',
          plan: Math.random() > 0.7 ? 'pro' : 'free',
          notifications: Math.floor(Math.random() * 5) + 1,
          completedAssessments: Math.floor(Math.random() * 12) + 3
        });
      }
    };
    
    checkUserAuth();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsUserMenuOpen(false);
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic navigation items based on user state
  const getNavItems = () => {
    const baseItems = [
      { name: 'Assessments', href: '/assessments', icon: Brain, showAlways: true },
    ];

    if (isLoggedIn) {
      return [
        ...baseItems,
        { name: 'AI Chat', href: '/chat', icon: MessageCircle, showAlways: false },
        { name: 'Career Paths', href: '/career-paths', icon: Target, showAlways: false },
        { name: 'Mentorship', href: '/mentorship', icon: Users, showAlways: false },
        { name: 'Insights', href: '/insights', icon: BarChart3, showAlways: false },
      ];
    } else {
      return [
        ...baseItems,
        { name: 'Career Paths', href: '/career-paths', icon: Target, showAlways: true },
        { name: 'Mentorship', href: '/mentorship', icon: Users, showAlways: true },
        { name: 'Insights', href: '/insights', icon: BarChart3, showAlways: true },
      ];
    }
  };

  const navItems = getNavItems();

  // Breadcrumb generation
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const navItem = navItems.find(item => item.href === currentPath);
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, href: currentPath });
      } else {
        // Capitalize and format segment
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        breadcrumbs.push({ name, href: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const handleMarkAllNotificationsRead = () => {
    if (userProfile) {
      setUserProfile({ ...userProfile, notifications: 0 });
    }
    setIsNotificationMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg shadow-soft border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-green transition-all duration-300">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold heading-font gradient-text">CareerCounsel</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 block leading-none body-font">
                  {isLoggedIn ? `Welcome back, ${userProfile?.name.split(' ')[0]}!` : 'AI-Powered Platform'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group relative ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
          {/* Right Side - Dynamic based on auth state */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />
            
            {!isLoggedIn ? (
              // Guest user buttons
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="btn-primary shadow-glow hover:shadow-glow-green"
                >
                  Get Started
                </button>
              </>
            ) : (
              // Logged in user elements
              <>
                {/* Notifications */}
                <div className="relative dropdown-container">
                  <button 
                    onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
                    className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                  >
                    <Bell className="h-5 w-5" />
                    {userProfile?.notifications && userProfile.notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {userProfile.notifications}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 z-50">
                      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                          <button 
                            onClick={() => setIsNotificationMenuOpen(false)}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {/* Sample notifications */}
                        <div className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-600">
                          <div className="flex items-start space-x-3">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">New career assessment available</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Discover your ideal career path with our updated assessment tool.</p>
                              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">2 hours ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-600">
                          <div className="flex items-start space-x-3">
                            <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">Mentorship session scheduled</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Your session with Sarah Johnson is scheduled for tomorrow at 3 PM.</p>
                              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">1 day ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-600">
                          <div className="flex items-start space-x-3">
                            <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">New course recommendation</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Based on your interests, we recommend "Data Science Fundamentals".</p>
                              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">3 days ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleMarkAllNotificationsRead}
                            className="flex-1 text-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium py-2 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            Mark all read
                          </button>
                          <button 
                            onClick={() => router.push('/notifications')}
                            className="flex-1 text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          >
                            View all
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-9 w-9 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full flex items-center justify-center text-white font-medium shadow-soft">
                        <span className="text-sm">{userProfile?.initials}</span>
                      </div>
                      <div className="hidden xl:block text-left">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {userProfile?.name.split(' ')[0]}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {userProfile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                        </div>
                      </div>
                    </div>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 card card-hover py-2 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10">
                      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full flex items-center justify-center text-white font-medium">
                            <span>{userProfile?.initials}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {userProfile?.name}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {userProfile?.email}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                userProfile?.plan === 'pro' 
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}>
                                {userProfile?.plan === 'pro' ? 'Pro' : 'Free'}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {userProfile?.completedAssessments} assessments
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">
                        <TrendingUp className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">
                        <User className="h-4 w-4" />
                        <span>Your Profile</span>
                      </Link>
                      <Link href="/calendar" className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">
                        <Calendar className="h-4 w-4" />
                        <span>Calendar</span>
                      </Link>
                      {userProfile?.plan === 'free' && (
                        <Link href="/upgrade" className="flex items-center space-x-3 px-4 py-3 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
                          <Award className="h-4 w-4" />
                          <span>Upgrade to Pro</span>
                        </Link>
                      )}
                      <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className="my-2 border-neutral-200 dark:border-neutral-600" />
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 py-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center space-x-2">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-neutral-400" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link 
                      href={crumb.href}
                      className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-200"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg shadow-soft border-b border-neutral-200 dark:border-neutral-800">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.name}</span>
                  {isActive && <div className="ml-auto w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>}
                </Link>
              );
            })}
            
            <hr className="my-3 border-neutral-200 dark:border-neutral-700" />
            
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    router.push('/login');
                    setIsMenuOpen(false);
                  }}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    router.push('/register');
                    setIsMenuOpen(false);
                  }}
                  className="btn-primary w-full text-center flex items-center justify-center space-x-2"
                >
                  <Rocket className="h-4 w-4" />
                  <span>Get Started</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full flex items-center justify-center text-white font-medium">
                    <span className="text-sm">{userProfile?.initials}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {userProfile?.name}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {userProfile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'} • {userProfile?.completedAssessments} assessments
                    </div>
                  </div>
                  {userProfile?.notifications && userProfile.notifications > 0 && (
                    <div className="ml-auto">
                      <span className="h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {userProfile.notifications}
                      </span>
                    </div>
                  )}
                </div>
                
                <Link href="/notifications" className="flex items-center space-x-3 px-4 py-3 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg text-base font-medium transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                  {userProfile?.notifications && userProfile.notifications > 0 && (
                    <div className="ml-auto">
                      <span className="h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {userProfile.notifications}
                      </span>
                    </div>
                  )}
                </Link>
                
                <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg text-base font-medium transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-base font-medium transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;