'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Users, 
  BarChart3,
  Target, 
  GraduationCap, 
  CheckCircle, 
  Globe,
  Sparkles,
  Briefcase,
  TrendingUp,
  Star,
  Award,
  Clock,
  Zap,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate user state
  const router = useRouter();

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Dynamic hero slides based on user state
  const getHeroSlides = () => {
    const baseSlides = [
      {
        title: isLoggedIn ? "Continue Your Career Journey" : "Discover Your Perfect Career Path",
        subtitle: isLoggedIn ? "AI-powered insights just for you" : "AI-powered assessments to unlock your potential",
        description: isLoggedIn 
          ? "Welcome back! Your personalized dashboard shows 3 new career matches and 2 mentor recommendations waiting for you."
          : "Get personalized career recommendations based on your skills, interests, and market trends. Our advanced AI analyzes thousands of career paths to find your perfect match.",
        cta: isLoggedIn ? "View Dashboard" : "Take Free Assessment",
        action: () => router.push(isLoggedIn ? '/dashboard' : '/assessments'),
        icon: Brain,
        gradient: "from-primary-600 to-secondary-500"
      },
      {
        title: isLoggedIn ? "Your Mentor Network" : "Connect with Industry Mentors",
        subtitle: isLoggedIn ? "3 new mentor matches available" : "Learn from experienced professionals",
        description: isLoggedIn
          ? "Sarah Chen and 2 other mentors have availability this week. Continue building your professional network with 1-on-1 guidance."
          : "Book 1-on-1 sessions with mentors who've walked the path you want to take. Get insider knowledge, career advice, and networking opportunities.",
        cta: isLoggedIn ? "Book Session" : "Find Your Mentor",
        action: () => router.push('/mentorship'),
        icon: Users,
        gradient: "from-secondary-500 to-accent-400"
      },
      {
        title: isLoggedIn ? "Trending in Your Field" : "Stay Ahead with Market Insights",
        subtitle: isLoggedIn ? "5 new opportunities in your area" : "Data-driven career decisions",
        description: isLoggedIn
          ? "Software engineering roles increased 12% this month. Discover high-paying remote opportunities that match your skill set."
          : "Access real-time job market trends, salary insights, and emerging opportunities. Make informed decisions about your career future.",
        cta: isLoggedIn ? "View Opportunities" : "Explore Insights",
        action: () => router.push('/insights'),
        icon: BarChart3,
        gradient: "from-accent-400 to-primary-600"
      }
    ];
    
    return baseSlides;
  };

  const heroSlides = getHeroSlides();

  useEffect(() => {
    setIsVisible(true);
    // Simulate checking user login status
    const checkUserStatus = () => {
      // In real app, this would check actual auth state
      setIsLoggedIn(Math.random() > 0.5);
    };
    checkUserStatus();
  }, []);

  // Auto-advance with pause and progress
  useEffect(() => {
    if (isPaused) return;

    const slideInterval = 6000; // 6 seconds per slide
    const progressInterval = 50; // Update progress every 50ms

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (progressInterval / slideInterval) * 100;
        if (newProgress >= 100) {
          setCurrentSlide(prevSlide => (prevSlide + 1) % heroSlides.length);
          return 0;
        }
        return newProgress;
      });
    }, progressInterval);

    return () => clearInterval(progressTimer);
  }, [isPaused, currentSlide, heroSlides.length]);

  // Reset progress when slide changes manually
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  const stats = isLoggedIn ? [
    { value: "12", label: "Assessments Completed", icon: Target },
    { value: "8", label: "Mentor Sessions", icon: GraduationCap },
    { value: "96%", label: "Personal Match Rate", icon: CheckCircle },
    { value: "Live", label: "Active Status", icon: Globe }
  ] : [
    { value: "50K+", label: "Successful Assessments", icon: Target },
    { value: "1.2K+", label: "Expert Mentors", icon: GraduationCap },
    { value: "95%", label: "Career Match Rate", icon: CheckCircle },
    { value: "24/7", label: "Platform Access", icon: Globe }
  ];

  const currentHero = heroSlides[currentSlide];

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-primary-900/20 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-400 rounded-full filter blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-bounce-slow">
          <div className="w-12 h-12 bg-primary-500 rounded-full opacity-10"></div>
        </div>
        <div className="absolute top-3/4 right-1/4 animate-bounce-slow delay-1000">
          <div className="w-8 h-8 bg-secondary-500 rounded-full opacity-10"></div>
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce-slow delay-2000">
          <div className="w-6 h-6 bg-accent-400 rounded-full opacity-10"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-110 group"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-110 group"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300 mb-4 shadow-soft">
                <span className="h-2 w-2 bg-secondary-500 rounded-full mr-2 animate-pulse"></span>
                {isLoggedIn ? `Welcome Back! ✨` : `AI Platform Live ✨`}
              </span>
              {/* Auto-advance Progress Bar */}
              {!isPaused && (
                <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-2">
                  <div 
                    className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
              {isPaused && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Slideshow paused
                </div>
              )}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold heading-font text-enhanced leading-tight mb-6">
              <span className={`bg-gradient-to-r ${currentHero.gradient} bg-clip-text text-transparent animate-fade-in font-extrabold`}>
                {currentHero.title}
              </span>
            </h1>
            
            <h2 className="text-xl sm:text-2xl text-enhanced font-semibold mb-4 body-font flex items-center justify-center lg:justify-start">
              <currentHero.icon className="h-6 w-6 mr-2 text-primary-600" />
              {currentHero.subtitle}
            </h2>
            
            <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto lg:mx-0 body-font leading-relaxed font-medium">
              {currentHero.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={currentHero.action}
                className="btn-primary shadow-glow hover:shadow-glow-green transform hover:-translate-y-1 text-lg px-8 py-4 flex items-center justify-center"
              >
                <currentHero.icon className="h-5 w-5 mr-2" />
                {currentHero.cta}
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="btn-outline text-lg px-8 py-4 transform hover:-translate-y-1 flex items-center justify-center"
              >
                <Eye className="h-5 w-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                      <IconComponent className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold heading-font gradient-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 body-font">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Visual */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative z-10">
              {/* Main Dashboard Mockup */}
              <div className="card-enhanced shadow-card-hover p-6 transform rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-accent-400 rounded-full"></div>
                    <div className="h-3 w-3 bg-secondary-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-enhanced body-font">Career Dashboard 🚀</span>
                </div>
                
                <div className="space-y-4">
                  <div className={`h-4 bg-gradient-to-r ${currentHero.gradient} rounded w-3/4 animate-pulse`}></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center transition-colors duration-300">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400 heading-font">95%</div>
                        <div className="text-xs text-primary-600 dark:text-primary-400 body-font">Match Score</div>
                      </div>
                    </div>
                    <div className="h-20 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg flex items-center justify-center transition-colors duration-300">
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary-600 dark:text-secondary-400 heading-font">24</div>
                        <div className="text-xs text-secondary-600 dark:text-secondary-400 body-font">Opportunities</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-4/5 animate-pulse delay-200"></div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-3/5 animate-pulse delay-400"></div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 card-enhanced shadow-glow p-4 transform -rotate-12 hover:rotate-0 transition-all duration-500 hover:scale-110">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold heading-font text-enhanced">AI Match</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-300 body-font">Data Scientist</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 card-enhanced shadow-glow-green p-4 transform rotate-12 hover:rotate-0 transition-all duration-500 hover:scale-110">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold heading-font text-enhanced">Hot Job</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-300 body-font">$120k - Remote</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 card shadow-glow-yellow p-3 transform rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 bg-accent-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📈</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold heading-font text-neutral-800 dark:text-neutral-200">+15%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Slide Indicators with Labels */}
        <div className="flex justify-center mt-16 space-x-4">
          {heroSlides.map((slide, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className={`group flex flex-col items-center transition-all duration-300 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-neutral-800/50 ${
                currentSlide === index ? 'scale-110' : 'hover:scale-105'
              }`}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
            >
              <div className={`h-3 w-3 rounded-full transition-all duration-300 mb-2 ${
                currentSlide === index 
                  ? 'bg-primary-600 dark:bg-primary-400 scale-125' 
                  : 'bg-neutral-300 dark:bg-neutral-600 group-hover:bg-primary-300 dark:group-hover:bg-primary-700'
              }`}>
                {currentSlide === index && (
                  <div 
                    className="h-full bg-secondary-500 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                )}
              </div>
              <span className={`text-xs transition-all duration-300 ${
                currentSlide === index 
                  ? 'text-primary-600 dark:text-primary-400 font-medium' 
                  : 'text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
              }`}>
                {slide.title.split(' ').slice(0, 2).join(' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center">
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 body-font">Discover More</span>
          <div className="p-2 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-soft">
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;