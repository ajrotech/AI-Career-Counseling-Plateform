'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();

  const features = [
    {
      id: 1,
      title: "AI-Powered Career Assessment",
      description: "Discover your strengths, interests, and personality traits with our advanced AI assessment that analyzes over 200 career factors.",
      icon: "🧠",
      gradient: "from-primary-600 to-secondary-500",
      stats: { users: "50K+", accuracy: "95%", time: "15 min" },
      cta: "Take Assessment",
      href: "/assessments",
      features: [
        "Personality analysis with 16 dimensions",
        "Skills mapping and gap identification",
        "Interest and values alignment",
        "Market demand integration",
        "Personalized career roadmaps"
      ],
      image: "🎯"
    },
    {
      id: 2,
      title: "Live Mentorship Marketplace",
      description: "Connect with industry experts and experienced professionals for personalized guidance, career advice, and networking opportunities.",
      icon: "👥",
      gradient: "from-secondary-500 to-accent-400",
      stats: { mentors: "1.2K+", sessions: "10K+", rating: "4.9⭐" },
      cta: "Find Mentors",
      href: "/mentorship",
      features: [
        "1-on-1 video sessions with experts",
        "Industry-specific mentorship",
        "Flexible scheduling system",
        "Progress tracking and goals",
        "Community networking events"
      ],
      image: "🎤"
    },
    {
      id: 3,
      title: "Real-Time Market Insights",
      description: "Stay ahead with comprehensive job market data, salary trends, skill demands, and emerging opportunities across industries.",
      icon: "📊",
      gradient: "from-accent-400 to-primary-600",
      stats: { jobs: "100K+", companies: "5K+", updates: "Real-time" },
      cta: "View Insights",
      href: "/insights",
      features: [
        "Live job market analytics",
        "Salary benchmarking tools",
        "Skills demand forecasting",
        "Industry growth predictions",
        "Geographic opportunity mapping"
      ],
      image: "📈"
    },
    {
      id: 4,
      title: "Personalized Learning Paths",
      description: "Get customized learning recommendations and skill development plans tailored to your career goals and current expertise level.",
      icon: "🎓",
      gradient: "from-primary-600 to-secondary-500",
      stats: { courses: "500+", partners: "50+", completion: "85%" },
      cta: "Start Learning",
      href: "/learning",
      features: [
        "Adaptive learning algorithms",
        "Industry-certified courses",
        "Hands-on project assignments",
        "Progress tracking and analytics",
        "Certificate and badge system"
      ],
      image: "📚"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Data Scientist at Google",
      content: "The AI assessment was incredibly accurate. It identified my strengths in analytics and recommended data science, which turned out to be my perfect career match!",
      avatar: "👩‍💻",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager at Meta",
      content: "My mentor guided me through the transition from engineering to product management. The platform's networking features were invaluable for my career growth.",
      avatar: "👨‍💼",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "UX Designer at Netflix",
      content: "The market insights helped me understand which design skills were in highest demand. I focused my learning accordingly and landed my dream job!",
      avatar: "👩‍🎨",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold heading-font gradient-text mb-6">
            Everything You Need for Career Success
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto body-font leading-relaxed">
            Our comprehensive platform combines AI technology, human expertise, and real-time data to guide your career journey from discovery to success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="card card-hover p-8 group cursor-pointer transition-all duration-500 hover:scale-105"
              onClick={() => setActiveFeature(index)}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-glow group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold heading-font text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 body-font leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Feature Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(feature.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold heading-font gradient-text">{value}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize body-font">{key}</div>
                  </div>
                ))}
              </div>

              {/* Feature List */}
              <div className="space-y-2 mb-6">
                {feature.features.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="text-secondary-500">✓</span>
                    <span className="body-font">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(feature.href);
                }}
                className={`w-full bg-gradient-to-r ${feature.gradient} text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:shadow-glow hover:scale-105 focus-ring`}
              >
                <span className="mr-2">{feature.icon}</span>
                {feature.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Interactive Feature Showcase */}
        <div className="card p-8 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold heading-font text-neutral-900 dark:text-neutral-100 mb-6">
                See Our Features in Action
              </h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <div className="font-semibold heading-font text-neutral-900 dark:text-neutral-100">{feature.title}</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400 body-font">{feature.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="card p-6 shadow-card-hover">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">{features[activeFeature].image}</div>
                  <h4 className="text-xl font-bold heading-font text-neutral-900 dark:text-neutral-100">
                    {features[activeFeature].title}
                  </h4>
                </div>
                <div className="space-y-3">
                  {features[activeFeature].features.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <span className="text-secondary-500">✨</span>
                      <span className="text-sm body-font text-neutral-700 dark:text-neutral-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold heading-font gradient-text mb-6">
            What Our Users Are Saying
          </h3>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 body-font">
            Join thousands of professionals who've transformed their careers with our platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">{testimonial.avatar}</div>
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-accent-400 text-xl">⭐</span>
                ))}
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 body-font italic mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <div className="font-semibold heading-font text-neutral-900 dark:text-neutral-100">{testimonial.name}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 body-font">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;