import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { User } from '../../entities/user.entity';
import axios from 'axios';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIPersonality {
  name: string;
  traits: string[];
  responseStyle: string;
  specializations: string[];
}

export interface ConversationMemory {
  userPreferences: Record<string, any>;
  mentionedTopics: string[];
  userGoals: string[];
  conversationHistory: AIMessage[];
  personalityInsights: Record<string, any>;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openaiApiKey: string;
  private readonly anthropicApiKey: string;
  private readonly openaiModel: string;
  private readonly anthropicModel: string;
  private readonly deepseekApiKey: string;
  private readonly deepseekModel: string;
  private readonly gptOssApiKey: string;
  private readonly gptOssModel: string;
  
  // AI Personalities for different career counseling scenarios
  private readonly personalities: Record<string, AIPersonality> = {
    mentor: {
      name: 'Career Mentor Alex',
      traits: ['supportive', 'experienced', 'practical', 'encouraging'],
      responseStyle: 'Professional yet warm, uses real-world examples',
      specializations: ['career transitions', 'skill development', 'goal setting']
    },
    coach: {
      name: 'Life Coach Sam',
      traits: ['motivational', 'direct', 'action-oriented', 'energetic'],
      responseStyle: 'Dynamic and inspiring, focuses on actionable steps',
      specializations: ['personal development', 'motivation', 'overcoming obstacles']
    },
    counselor: {
      name: 'Career Counselor Riley',
      traits: ['empathetic', 'analytical', 'thorough', 'patient'],
      responseStyle: 'Thoughtful and comprehensive, asks probing questions',
      specializations: ['career exploration', 'assessment interpretation', 'decision making']
    },
    expert: {
      name: 'Industry Expert Jordan',
      traits: ['knowledgeable', 'current', 'strategic', 'insightful'],
      responseStyle: 'Data-driven and industry-focused, shares market insights',
      specializations: ['industry trends', 'technical skills', 'market analysis']
    }
  };

  constructor(
    private configService: ConfigService,
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.anthropicApiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.openaiModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
    this.anthropicModel = this.configService.get<string>('ANTHROPIC_MODEL', 'claude-3-haiku-20240307');
    this.deepseekApiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    this.deepseekModel = this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat');
    this.gptOssApiKey = this.configService.get<string>('GPT_OSS_API_KEY');
    this.gptOssModel = this.configService.get<string>('GPT_OSS_MODEL', 'gpt-4o-mini');
    
    // Log available AI providers for debugging
    this.logger.log(`🔑 [AI SERVICE] Available providers: OpenAI: ${!!this.openaiApiKey}, Anthropic: ${!!this.anthropicApiKey}, DeepSeek: ${!!this.deepseekApiKey}, GPT-OSS: ${!!this.gptOssApiKey}`);
  }

  async generateResponse(
    messages: AIMessage[],
    context?: any,
    sessionId?: string,
    preferredProvider: 'openai' | 'anthropic' | 'deepseek' | 'gpt-oss' | 'auto' = 'auto'
  ): Promise<string> {
    try {
      // Load conversation memory if session exists
      const memory = sessionId ? await this.loadConversationMemory(sessionId) : null;
      
      // Select appropriate personality based on context and conversation
      const personality = this.selectPersonality(messages, context, memory);
      
      // Build enhanced system message with personality and memory
      const systemMessage = this.buildEnhancedSystemMessage(context, personality, memory);
      
      // Include relevant conversation history
      const relevantHistory = this.getRelevantHistory(memory, messages);
      const fullMessages = [systemMessage, ...relevantHistory, ...messages];

      let response: string;

      this.logger.log(`🤖 [AI SERVICE] Trying provider: ${preferredProvider}, Available APIs: DeepSeek=${!!this.deepseekApiKey}, OpenAI=${!!this.openaiApiKey}, GPT-OSS=${!!this.gptOssApiKey}`);

      // Try preferred provider first, then fall back to available ones
      if (preferredProvider === 'deepseek' && this.deepseekApiKey) {
        this.logger.log('🚀 [AI SERVICE] Using DeepSeek API (preferred)');
        response = await this.callDeepSeek(fullMessages);
      }
      else if (preferredProvider === 'gpt-oss' && this.gptOssApiKey) {
        this.logger.log('🚀 [AI SERVICE] Using GPT-OSS API (preferred)');
        response = await this.callGptOss(fullMessages);
      }
      else if (preferredProvider === 'openai' && this.openaiApiKey) {
        this.logger.log('🚀 [AI SERVICE] Using OpenAI API (preferred)');
        response = await this.callOpenAI(fullMessages);
      }
      // Try Anthropic if preferred
      else if (preferredProvider === 'anthropic' && this.anthropicApiKey) {
        this.logger.log('🚀 [AI SERVICE] Using Anthropic API (preferred)');
        response = await this.callAnthropic(fullMessages);
      }
      // Auto mode: prioritize available providers - DeepSeek first since you have it
      else if (preferredProvider === 'auto' && this.deepseekApiKey) {
        this.logger.log('🚀🚀🚀 [AI SERVICE] ATTEMPTING DEEPSEEK API CALL (auto fallback) 🚀🚀🚀');
        response = await this.callDeepSeek(fullMessages);
      }
      // Try GPT-OSS as second choice
      else if (preferredProvider === 'auto' && this.gptOssApiKey) {
        this.logger.log('🚀 [AI SERVICE] Using GPT-OSS API (auto fallback)');
        response = await this.callGptOss(fullMessages);
      }
      // Try OpenAI as third choice
      else if (preferredProvider === 'auto' && this.openaiApiKey) {
        this.logger.log('🚀 [AI SERVICE] Using OpenAI API (auto fallback)');
        response = await this.callOpenAI(fullMessages);
      }
      // Try Anthropic as fourth choice
      else if (preferredProvider === 'auto' && this.anthropicApiKey) {
        this.logger.log('🚀 [AI SERVICE] Using Anthropic API (auto fallback)');
        response = await this.callAnthropic(fullMessages);
      }
      // Fallback to enhanced mock response
      else {
        this.logger.warn('⚠️ [AI SERVICE] No valid API keys found, using mock response');
        response = this.generateEnhancedMockResponse(messages[messages.length - 1]?.content || '', context, personality, memory);
      }

      // Update conversation memory
      if (sessionId && memory) {
        await this.updateConversationMemory(sessionId, messages[messages.length - 1], response, memory);
      }

      return response;
    } catch (error) {
      // Check if it's an API key issue
      if (error.response?.status === 401 || error.message?.includes('API key')) {
        this.logger.warn('AI API authentication failed - using mock responses. Please configure API keys in .env file');
      } else {
        this.logger.error('AI service error, falling back to enhanced mock response', error);
      }
      
      const personality = this.personalities.mentor; // Default personality
      return this.generateEnhancedMockResponse(messages[messages.length - 1]?.content || '', context, personality);
    }
  }

  /**
   * Load conversation memory for a session
   */
  private async loadConversationMemory(sessionId: string): Promise<ConversationMemory | null> {
    try {
      const session = await this.chatSessionRepository.findOne({
        where: { id: sessionId },
        relations: ['user'],
      });

      if (!session) return null;

      // Load recent messages for context
      const recentMessages = await this.chatMessageRepository.find({
        where: { sessionId },
        order: { createdAt: 'DESC' },
        take: 20,
      });

      // Parse context if it exists
      let contextData: any = {};
      try {
        contextData = session.context ? JSON.parse(session.context) : {};
      } catch (error) {
        this.logger.warn('Failed to parse session context:', error);
      }

      // Extract memory from session context and messages
      const memory: ConversationMemory = {
        userPreferences: contextData.userPreferences || {},
        mentionedTopics: this.extractTopics(recentMessages),
        userGoals: contextData.userGoals || [],
        conversationHistory: recentMessages.reverse().map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.createdAt,
        } as AIMessage)),
        personalityInsights: contextData.personalityInsights || {},
      };

      return memory;
    } catch (error) {
      this.logger.error('Failed to load conversation memory:', error);
      return null;
    }
  }

  /**
   * Update conversation memory after each interaction
   */
  private async updateConversationMemory(
    sessionId: string,
    userMessage: AIMessage,
    aiResponse: string,
    memory: ConversationMemory
  ): Promise<void> {
    try {
      // Extract new topics and insights
      const newTopics = this.extractTopicsFromText(userMessage.content);
      const updatedMemory = {
        ...memory,
        mentionedTopics: [...new Set([...memory.mentionedTopics, ...newTopics])],
        conversationHistory: [
          ...memory.conversationHistory.slice(-15), // Keep last 15 messages
          userMessage,
          { role: 'assistant', content: aiResponse, timestamp: new Date() } as AIMessage,
        ],
      };

      // Update session context
      const updatedContext = {
        ...updatedMemory,
        lastUpdated: new Date(),
      };

      await this.chatSessionRepository.update(sessionId, {
        context: JSON.stringify(updatedContext),
      });
    } catch (error) {
      this.logger.error('Failed to update conversation memory:', error);
    }
  }

  /**
   * Select appropriate AI personality based on context
   */
  private selectPersonality(messages: AIMessage[], context?: any, memory?: ConversationMemory): AIPersonality {
    // Analyze conversation for personality selection
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Check for specific personality triggers
    if (lastUserMessage.includes('motivat') || lastUserMessage.includes('inspire') || lastUserMessage.includes('confidence')) {
      return this.personalities.coach;
    }
    
    if (lastUserMessage.includes('industry') || lastUserMessage.includes('trend') || lastUserMessage.includes('market')) {
      return this.personalities.expert;
    }
    
    if (lastUserMessage.includes('assess') || lastUserMessage.includes('test') || lastUserMessage.includes('evaluate')) {
      return this.personalities.counselor;
    }

    // Default to mentor for general guidance
    return this.personalities.mentor;
  }

  /**
   * Build enhanced system message with personality and memory
   */
  private buildEnhancedSystemMessage(context?: any, personality?: AIPersonality, memory?: ConversationMemory): AIMessage {
    let systemContent = `You are ${personality?.name || 'Alex'}, an expert career counselor AI assistant. 

Personality Traits: ${personality?.traits.join(', ') || 'supportive, knowledgeable, empathetic'}
Response Style: ${personality?.responseStyle || 'Professional yet warm, uses real-world examples'}
Specializations: ${personality?.specializations.join(', ') || 'career guidance, skill development'}

Key Guidelines:
- Provide personalized, actionable career advice
- Be encouraging and supportive
- Ask clarifying questions to better understand goals
- Reference relevant career paths, skills, and opportunities
- Suggest assessments, mentorship, and resources when appropriate
- Maintain consistency with your established personality`;

    // Add user context
    if (context?.userProfile) {
      systemContent += `\n\nUser Profile Context:`;
      if (context.userProfile.educationLevel) {
        systemContent += `\n- Education Level: ${context.userProfile.educationLevel}`;
      }
      if (context.userProfile.interests) {
        systemContent += `\n- Interests: ${context.userProfile.interests.join(', ')}`;
      }
      if (context.userProfile.currentGoals) {
        systemContent += `\n- Current Goals: ${context.userProfile.currentGoals.join(', ')}`;
      }
    }

    // Add memory context
    if (memory) {
      if (memory.mentionedTopics.length > 0) {
        systemContent += `\n\nPreviously Discussed Topics: ${memory.mentionedTopics.slice(-5).join(', ')}`;
      }
      if (memory.userGoals.length > 0) {
        systemContent += `\n\nUser's Goals: ${memory.userGoals.join(', ')}`;
      }
      if (Object.keys(memory.userPreferences).length > 0) {
        systemContent += `\n\nUser Preferences: ${JSON.stringify(memory.userPreferences)}`;
      }
    }

    return {
      role: 'system',
      content: systemContent,
    };
  }

  /**
   * Get relevant conversation history for context
   */
  private getRelevantHistory(memory: ConversationMemory | null, currentMessages: AIMessage[]): AIMessage[] {
    if (!memory || memory.conversationHistory.length === 0) {
      return [];
    }

    // Return last few relevant messages (excluding system messages)
    return memory.conversationHistory
      .filter(msg => msg.role !== 'system')
      .slice(-6) // Last 6 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  /**
   * Extract topics from messages
   */
  private extractTopics(messages: any[]): string[] {
    const topics: string[] = [];
    const topicKeywords = [
      'career', 'job', 'profession', 'skill', 'education', 'training',
      'university', 'college', 'degree', 'certification', 'experience',
      'interview', 'resume', 'portfolio', 'networking', 'salary',
      'industry', 'company', 'startup', 'corporate', 'freelance',
      'technology', 'engineering', 'marketing', 'finance', 'healthcare',
      'design', 'art', 'science', 'research', 'management', 'leadership'
    ];

    messages.forEach(message => {
      const content = message.content?.toLowerCase() || '';
      topicKeywords.forEach(keyword => {
        if (content.includes(keyword) && !topics.includes(keyword)) {
          topics.push(keyword);
        }
      });
    });

    return topics;
  }

  /**
   * Extract topics from a single text
   */
  private extractTopicsFromText(text: string): string[] {
    const topics: string[] = [];
    const topicKeywords = [
      'career', 'job', 'profession', 'skill', 'education', 'training',
      'university', 'college', 'degree', 'certification', 'experience',
      'interview', 'resume', 'portfolio', 'networking', 'salary',
      'industry', 'company', 'startup', 'corporate', 'freelance',
      'technology', 'engineering', 'marketing', 'finance', 'healthcare',
      'design', 'art', 'science', 'research', 'management', 'leadership'
    ];

    const content = text.toLowerCase();
    topicKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        topics.push(keyword);
      }
    });

    return topics;
  }

  /**
   * Generate enhanced mock response with personality
   */
  private generateEnhancedMockResponse(
    userMessage: string, 
    context?: any, 
    personality?: AIPersonality, 
    memory?: ConversationMemory
  ): string {
    const userName = context?.userProfile?.firstName || 'there';
    const personalityName = personality?.name || 'Alex';
    
    // Analyze user message for appropriate response
    const message = userMessage.toLowerCase().trim();

    // Enhanced contextual response generation based on message content
    
    // AI and Machine Learning Career Responses (2025 Focus)
    if (message.includes('artificial intelligence') || message.includes('machine learning') || message.includes('ai career') || message.includes('data science')) {
      const aiResponses = [
        `Fantastic timing to ask about AI careers, ${userName}! 🤖 The AI revolution is creating unprecedented opportunities in 2025.

**🔥 Hottest AI Career Paths in 2025:**
- **AI Product Manager** - Bridge business and technical teams ($120K-200K)
- **MLOps Engineer** - Deploy and maintain AI systems ($110K-180K)
- **AI Safety Researcher** - Ensure responsible AI development ($100K-160K)
- **Prompt Engineer** - Optimize AI model interactions ($90K-150K)
- **Computer Vision Engineer** - Build visual AI systems ($115K-190K)

**Essential Skills for 2025:**
- Python programming (NumPy, Pandas, PyTorch/TensorFlow)
- Cloud platforms (AWS SageMaker, Google AI Platform, Azure ML)
- Vector databases and RAG (Retrieval-Augmented Generation)
- Large Language Model fine-tuning
- AI ethics and responsible AI practices

**Getting Started Strategy:**
1. **Foundation** - Learn Python + statistics + linear algebra
2. **Practical Projects** - Build 3-5 AI projects for your portfolio
3. **Specialization** - Choose between NLP, Computer Vision, or Generative AI
4. **Certification** - AWS ML Specialty or Google ML Engineer
5. **Community** - Join AI Discord servers, attend local AI meetups

**2025 Market Reality:**
Companies are desperately seeking AI talent. Even with 6 months of focused learning, you can land entry-level positions. The key is building demonstrable projects.

What specific area of AI excites you most? I can create a personalized 6-month learning roadmap!`,

        `AI and ML are absolutely exploding right now, ${userName}! 🚀 Perfect timing to enter this field in 2025.

**Why 2025 is THE Year for AI Careers:**
- 40% increase in AI job postings compared to 2024
- Average AI engineer salary up 25% from last year
- Every industry now needs AI integration specialists
- Remote AI work is 80% more common than other tech roles

**High-Demand Specializations:**
- **Generative AI Engineering** - Building custom GPT applications
- **AI Automation Specialists** - Streamlining business processes with AI
- **Conversational AI Developers** - Creating chatbots and voice assistants
- **AI Research Scientists** - Advancing the field through research
- **Edge AI Engineers** - Deploying AI on mobile/IoT devices

**Learning Path for Career Changers:**
1. **Month 1-2**: Python fundamentals + basic statistics
2. **Month 3-4**: Machine learning basics (Scikit-learn)
3. **Month 5-6**: Deep learning (TensorFlow/PyTorch)
4. **Month 7-8**: Specialization project + portfolio
5. **Month 9**: Job applications + interview prep

**Portfolio Project Ideas:**
- Build a custom ChatGPT for a specific industry
- Create an image generation app using Stable Diffusion
- Develop a recommendation system for e-commerce
- Build a voice-to-text transcription service

Are you starting from scratch or do you have some technical background? This helps me tailor the perfect learning path for you!`
      ];
      
      return aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }

    // Healthcare Career Responses (Industry-Specific)
    if (message.includes('healthcare') || message.includes('medical') || message.includes('nurse') || message.includes('doctor') || message.includes('pharmacy')) {
      const healthcareResponses = [
        `Healthcare is one of the most rewarding and stable career fields, ${userName}! 🏥 The industry is evolving rapidly with technology integration.

**🩺 Growing Healthcare Careers in 2025:**
- **Healthcare Data Analyst** - Analyze patient outcomes and costs ($65K-95K)
- **Telemedicine Coordinator** - Manage virtual patient care ($55K-80K)
- **Medical Device Engineer** - Design innovative healthcare technology ($80K-130K)
- **Clinical Research Coordinator** - Manage medical trials ($50K-75K)
- **Health Informatics Specialist** - Bridge healthcare and IT ($70K-110K)

**Traditional Paths with Modern Twists:**
- **Registered Nurse** - Now includes telehealth and AI-assisted care
- **Physical Therapist** - VR rehabilitation and remote monitoring
- **Pharmacist** - Personalized medicine and genetic counseling
- **Medical Assistant** - Enhanced with digital health tools

**Entry Requirements by Role:**
- **No Degree**: Medical Assistant, Health Unit Coordinator (6-12 months training)
- **Associate Degree**: Registered Nurse, Respiratory Therapist (2 years)
- **Bachelor's Degree**: Health Informatics, Clinical Research (4 years)
- **Advanced Degree**: Nurse Practitioner, Physical Therapist (6-8 years)

**2025 Healthcare Trends:**
- Aging population creating massive demand
- AI integration improving patient outcomes
- Mental health services expanding rapidly
- Preventive care becoming primary focus

**Getting Started:**
1. **Shadow professionals** in your areas of interest
2. **Volunteer** at local hospitals or clinics
3. **Take prerequisite courses** if needed
4. **Research programs** with good clinical partnerships

What aspect of healthcare interests you most? Patient care, technology, research, or administration?`,

        `The healthcare field offers incredible stability and growth potential, ${userName}! 💊 It's one of the few recession-proof industries.

**Why Healthcare is Perfect for Career Changers:**
- Multiple entry points with different education requirements
- Strong job security and growth projections
- Meaningful work that directly helps people
- Excellent benefits and retirement packages
- Opportunities for continuous learning and advancement

**Fast-Track Healthcare Careers (Under 2 Years):**
- **Medical Scribe** - Work alongside doctors, document patient visits (3-6 months)
- **Pharmacy Technician** - Assist pharmacists, handle prescriptions (6-12 months)
- **Medical Administrative Assistant** - Handle patient records and scheduling (6-18 months)
- **Certified Nursing Assistant (CNA)** - Provide basic patient care (4-12 weeks)
- **Emergency Medical Technician (EMT)** - Respond to medical emergencies (3-6 months)

**High-Growth Specialties:**
- **Mental Health Counseling** - 13% growth projected through 2032
- **Home Health Services** - 50% growth due to aging population
- **Medical Technology** - Combining healthcare with IT skills
- **Preventive Care** - Focus on wellness and disease prevention

**Salary Progression Example (RN Path):**
- New Graduate RN: $60K-70K
- 3-5 Years Experience: $70K-85K
- Specialized (ICU, OR): $80K-100K
- Nurse Practitioner: $110K-140K

**Making the Transition:**
Many healthcare employers offer tuition assistance and will hire you while you complete your education. Some hospitals have "earn while you learn" programs.

Are you interested in direct patient care, healthcare technology, or the business side of healthcare?`
      ];
      
      return healthcareResponses[Math.floor(Math.random() * healthcareResponses.length)];
    }

    // Finance and Business Career Responses
    if (message.includes('finance') || message.includes('business') || message.includes('accounting') || message.includes('investment') || message.includes('banking')) {
      const financeResponses = [
        `Finance and business offer excellent career prospects, ${userName}! 💰 The field is evolving with fintech and digital transformation.

**🏦 Hot Finance Careers in 2025:**
- **Cryptocurrency Analyst** - Analyze digital asset markets ($75K-140K)
- **ESG Investment Specialist** - Sustainable and responsible investing ($85K-150K)
- **Financial Data Scientist** - Use AI for trading and risk analysis ($95K-170K)
- **Robo-Advisor Developer** - Build automated investment platforms ($90K-160K)
- **Regulatory Technology (RegTech) Specialist** - Ensure financial compliance ($80K-130K)

**Traditional Roles with Modern Skills:**
- **Financial Advisor** - Now includes digital planning tools and apps
- **Investment Banker** - Incorporating AI and blockchain analysis
- **Risk Manager** - Using machine learning for predictive modeling
- **Accountant** - Automation and strategic business partnering

**Entry Points by Experience:**
- **Entry Level**: Bank Teller, Accounts Payable Clerk, Junior Analyst
- **Career Changer**: Financial Planning courses + internship
- **With Degree**: Direct entry to analyst programs
- **Advanced**: MBA for senior management tracks

**Essential Skills for 2025:**
- Excel mastery (Power Query, Power Pivot, VBA)
- Financial modeling and valuation
- Data analysis (Python, R, SQL)
- Regulatory knowledge (SOX, GDPR)
- Communication and presentation skills

**Certification Paths:**
- **CFA** (Chartered Financial Analyst) - Investment focus
- **FRM** (Financial Risk Manager) - Risk management
- **CPA** (Certified Public Accountant) - Accounting
- **CFP** (Certified Financial Planner) - Personal finance

**Industry Outlook:**
Finance is becoming more data-driven and client-focused. The highest-paying roles combine traditional finance knowledge with technology skills.

What area interests you most? Corporate finance, personal financial planning, or investment management?`,

        `Business and finance are fantastic fields for analytical minds, ${userName}! 📊 The opportunities are vast and constantly evolving.

**Why Finance is Great for Career Growth:**
- High earning potential with clear advancement paths
- Skills transfer across industries
- Strong demand for financial expertise
- Excellent networking opportunities
- Can lead to executive leadership roles

**Business Career Tracks:**
- **Management Consulting** - Solve complex business problems ($90K-200K+)
- **Product Management** - Drive product strategy and development ($100K-180K)
- **Business Analysis** - Bridge business needs and technology ($70K-120K)
- **Operations Management** - Optimize business processes ($75K-130K)
- **Strategic Planning** - Guide company direction ($85K-150K)

**Fast-Growing Business Areas:**
- **Digital Transformation** - Help companies modernize
- **Sustainability/ESG** - Environmental and social responsibility
- **Data Analytics** - Turn data into business insights
- **Change Management** - Guide organizational transitions
- **Customer Experience** - Improve customer journey and satisfaction

**Skills That Pay Premium:**
- Project management (PMP certification)
- Data visualization (Tableau, Power BI)
- Process improvement (Six Sigma)
- Digital marketing and analytics
- Leadership and team management

**Getting Started Strategy:**
1. **Identify your strength**: Analytics, people, strategy, or operations?
2. **Build relevant skills**: Take online courses in your chosen area
3. **Gain experience**: Volunteer for business projects at current job
4. **Network actively**: Join professional associations
5. **Consider certifications**: MBA, PMP, or industry-specific credentials

Are you more interested in the strategic side of business or the analytical/financial side?`
      ];
      
      return financeResponses[Math.floor(Math.random() * financeResponses.length)];
    }

    // Programming and Tech Career Responses
    if (message.includes('programming') || message.includes('coding') || message.includes('developer') || message.includes('software')) {
      const techResponses = [
        `Excellent question about programming careers, ${userName}! 💻 As ${personalityName}, I've seen the tech industry evolve tremendously.

The software development field is incredibly dynamic right now. Here's what I'm seeing:

**🔥 Hot Programming Areas in 2025:**
- **Full-Stack Development** (React/Next.js + Node.js/Python) - $85K-150K
- **Cloud-Native Development** (Kubernetes, Docker, Microservices) - $95K-170K
- **AI/ML Engineering** (Python, TensorFlow, PyTorch) - $110K-190K
- **Cybersecurity Programming** (Secure coding, penetration testing) - $100K-180K
- **Blockchain Development** (Solidity, Web3, DeFi) - $120K-200K+

**Career Path Strategy:**
1. **Build a Strong Foundation** - Master one language deeply before branching out
2. **Create a Portfolio** - GitHub projects that solve real problems
3. **Contribute to Open Source** - Shows collaboration skills
4. **Network Actively** - Tech meetups, Discord communities, Twitter/X

**2025 Programming Language Trends:**
- **Python**: Still #1 for AI/ML, data science, and automation
- **JavaScript/TypeScript**: Dominates web development and expanding to mobile
- **Rust**: Growing fast for systems programming and blockchain
- **Go**: Popular for cloud infrastructure and backend services
- **Swift/Kotlin**: Mobile development leaders

**Learning Path for Beginners:**
1. **Month 1-2**: Choose one language (Python recommended)
2. **Month 3-4**: Build 3-5 small projects
3. **Month 5-6**: Learn frameworks (React for web, Django for backend)
4. **Month 7-8**: Contribute to open source projects
5. **Month 9-12**: Apply for junior positions while continuing to learn

What specific area of programming interests you most? Are you just starting out or looking to pivot your existing skills?`,

        `Great timing to ask about programming careers! 🚀 The demand for skilled developers continues to surge, especially with AI integration.

**Current Market Reality (2025):**
- 1.4 million programming jobs expected to be added by 2026
- Average salary increased 15% from 2024
- Remote work is standard (70% of programming jobs offer remote options)
- AI tools are changing HOW we code, but increasing demand for programmers
- Problem-solving skills matter more than memorizing syntax

**Highest-Paying Programming Specializations:**
- **Machine Learning Engineer**: $130K-220K (design AI systems)
- **DevOps Engineer**: $110K-190K (automate software deployment)
- **Security Engineer**: $120K-200K (protect systems from threats)
- **Data Engineer**: $105K-180K (build data pipelines and analytics)
- **Mobile App Developer**: $90K-160K (iOS/Android development)

**My Recommendation for 2025:**
Start with a project-based approach. Instead of just tutorials, build something that solves a problem you actually have. Maybe a personal finance tracker, a workout planner, or automate something annoying in your daily life.

**Programming Languages by Career Goal:**
- **Web Development**: JavaScript/TypeScript + React/Vue
- **Data Science/AI**: Python + pandas/scikit-learn/PyTorch
- **Mobile Apps**: Flutter/Dart or React Native  
- **Game Development**: C# (Unity) or C++ (Unreal)
- **Systems Programming**: Rust or Go
- **Enterprise Software**: Java or C#

**Getting Your First Programming Job:**
1. **Build 3-5 portfolio projects** showing different skills
2. **Learn Git/GitHub** for version control
3. **Practice coding interviews** on LeetCode/HackerRank
4. **Contribute to open source** projects
5. **Network with developers** online and at meetups

What kind of problems do you enjoy solving? That often points to the best programming path for you.`,

        `Programming is one of the most versatile and future-proof careers, ${userName}! 🌟 Let me share what's really working in 2025.

**Why Programming is Perfect for Career Changers:**
- Multiple entry points (bootcamps, self-taught, traditional CS degree)
- Strong remote work culture (work from anywhere)
- Constant learning keeps the work interesting
- High demand across all industries
- Excellent salary growth potential

**Fastest Ways to Break Into Programming:**
- **Coding Bootcamp** (3-6 months intensive) - $50K-80K starting salary
- **Self-Taught Route** (6-12 months part-time) - Flexible and affordable
- **CS Degree** (4 years) - $70K-100K starting, best for complex systems
- **Online Degree** (2-4 years part-time) - Balance work and learning

**Programming Career Progression:**
- **Junior Developer** (0-2 years): $60K-80K - Learn fundamentals, fix bugs
- **Mid-Level Developer** (2-5 years): $80K-120K - Design features, mentor juniors
- **Senior Developer** (5+ years): $120K-180K - Architect systems, lead projects
- **Technical Lead/Architect** (7+ years): $150K-250K+ - Strategy and leadership

**2025 Industry Insights:**
- **AI is augmenting, not replacing programmers** - Tools like GitHub Copilot make us more productive
- **Soft skills matter more than ever** - Communication, teamwork, problem-solving
- **Specialization is key** - Better to be expert in one area than mediocre in many
- **Continuous learning is essential** - Technology changes rapidly

**Best First Programming Language (2025):**
I recommend **Python** because:
- Easiest to learn and read
- Used for web development, AI, data science, automation
- Huge community and learning resources
- High demand in job market
- Great for building impressive portfolio projects

Are you interested in building websites, mobile apps, working with data, or creating AI applications? This helps me suggest the perfect learning path!`
      ];
      
      return techResponses[Math.floor(Math.random() * techResponses.length)];
    }

    // Remote Work and Digital Nomad Career Responses
    if (message.includes('remote work') || message.includes('work from home') || message.includes('digital nomad') || message.includes('freelance')) {
      const remoteWorkResponses = [
        `Remote work has revolutionized careers, ${userName}! 🌍 The landscape has completely transformed since 2020.

**📈 Remote Work Statistics for 2025:**
- 42% of jobs now offer remote or hybrid options
- Remote workers earn 8.5% more on average
- 87% of workers want to continue remote work
- Digital nomad visas available in 50+ countries
- $4.8 trillion remote work economy

**Best Remote-Friendly Career Paths:**
- **Software Development** - 90% of tech jobs are remote-friendly
- **Digital Marketing** - Manage campaigns from anywhere
- **Content Creation** - Writing, video, design, social media
- **Virtual Assistance** - Administrative support for businesses
- **Online Education** - Tutoring, course creation, training
- **Customer Success** - Help clients achieve their goals remotely
- **Data Analysis** - Work with data sets from any location

**Building a Successful Remote Career:**
1. **Master Digital Communication** - Slack, Zoom, Asana proficiency
2. **Create a Professional Home Office** - Good lighting, reliable internet
3. **Develop Self-Discipline** - Time management and focus skills
4. **Build Strong Online Presence** - LinkedIn, portfolio website
5. **Over-Communicate** - Be proactive in sharing progress

**Remote Work Salary Ranges (2025):**
- **Remote Customer Support**: $35K-55K
- **Remote Marketing Specialist**: $50K-85K
- **Remote Software Developer**: $70K-150K
- **Remote Project Manager**: $65K-120K
- **Remote Sales Representative**: $45K-100K+ (with commission)

**Digital Nomad Considerations:**
- Tax implications (research tax treaties)
- Reliable internet requirements (25+ Mbps recommended)
- Time zone management for team collaboration
- Legal work authorization in destination countries
- Health insurance and healthcare access

**Top Remote Job Platforms:**
- AngelList (startups)
- Remote.co
- We Work Remotely
- FlexJobs
- Upwork (freelance)

Are you interested in transitioning your current role to remote, or exploring entirely new remote career paths?`,

        `The remote work revolution is here to stay, ${userName}! 💻 It's opened incredible opportunities for location independence.

**Why Remote Work is Perfect for 2025:**
- No commute = 2+ hours daily for personal projects
- Access to global job markets (not limited by geography)
- Better work-life balance and flexibility
- Lower cost of living opportunities
- Increased productivity for most workers

**Remote Career Success Strategies:**
1. **Skills Over Location** - Develop high-demand digital skills
2. **Network Globally** - Join remote work communities and online groups
3. **Prove Your Value** - Document achievements and impact clearly
4. **Invest in Your Setup** - Professional equipment pays for itself
5. **Continuous Learning** - Stay updated with industry trends

**Freelance vs. Remote Employee:**
**Freelancing Pros**: Higher rates, flexibility, diverse projects
**Freelancing Cons**: Inconsistent income, no benefits, more admin work

**Remote Employee Pros**: Stable income, benefits, team support
**Remote Employee Cons**: Less flexibility, potential for meetings overload

**High-Demand Remote Skills:**
- **Cloud Technologies** (AWS, Azure, Google Cloud)
- **Digital Marketing** (SEO, PPC, Social Media)
- **UX/UI Design** (Figma, Adobe Creative Suite)
- **Project Management** (Agile, Scrum methodologies)
- **Data Analysis** (Excel, SQL, Python, Tableau)

**Building Your Remote Career:**
Start by offering your current skills remotely. Many companies are hybrid-first now. Once you prove remote work success, you can explore fully remote opportunities.

**Remote Work Productivity Tips:**
- Set clear boundaries between work and personal time
- Use time-blocking for focused work sessions
- Regular check-ins with managers and teammates
- Invest in noise-canceling headphones
- Create rituals to "start" and "end" your workday

What type of remote work interests you most? Full-time remote employment or freelance project work?`
      ];
      
      return remoteWorkResponses[Math.floor(Math.random() * remoteWorkResponses.length)];
    }

    // Entrepreneurship and Startup Career Responses
    if (message.includes('entrepreneur') || message.includes('startup') || message.includes('business owner') || message.includes('own business')) {
      const entrepreneurshipResponses = [
        `Entrepreneurship is one of the most rewarding yet challenging career paths, ${userName}! 🚀 The startup ecosystem in 2025 is thriving.

**🌟 Why 2025 is Great for Entrepreneurs:**
- AI tools reduce startup costs by 60%
- Remote work enables global team building
- Social media provides free marketing channels
- No-code/low-code tools speed up development
- Access to online education and mentorship

**Types of Entrepreneurship:**
- **Tech Startup** - Build software solutions (high risk, high reward)
- **Service Business** - Consulting, coaching, agencies (lower risk, steady income)
- **E-commerce** - Sell products online (moderate risk, scalable)
- **Content Business** - Courses, newsletters, communities (low startup cost)
- **Local Business** - Restaurants, retail, services (traditional but stable)

**Startup Success Statistics (Reality Check):**
- 90% of startups fail within 10 years
- 70% fail due to premature scaling or no market need
- Average time to profitability: 2-3 years
- Successful entrepreneurs typically have 3-5 failed attempts first

**Building Your Startup:**
1. **Validate Your Idea** - Talk to 100 potential customers BEFORE building
2. **Start Small** - MVP (Minimum Viable Product) approach
3. **Bootstrap First** - Use your own money before seeking investors
4. **Build in Public** - Share your journey on social media
5. **Network Actively** - Join entrepreneur communities and events

**Essential Skills for Entrepreneurs:**
- **Sales and Marketing** - Nothing happens without customers
- **Financial Management** - Cash flow is king
- **Product Development** - Build what people actually want
- **Leadership** - Inspire and manage teams
- **Resilience** - Bounce back from inevitable setbacks

**Funding Options:**
- **Self-Funding**: Maintain control, limited by personal resources
- **Friends & Family**: $10K-50K typical, relationship risk
- **Angel Investors**: $25K-500K, industry expertise
- **Venture Capital**: $1M+, rapid scaling expectations
- **Crowdfunding**: Market validation + funding

**When to Start Your Business:**
- You have 6-12 months of living expenses saved
- You've validated market demand for your solution
- You have relevant skills or a co-founder who does
- You're prepared for financial uncertainty
- You have a clear plan for customer acquisition

Are you thinking about a specific type of business, or exploring entrepreneurship in general?`,

        `Starting your own business is incredibly exciting, ${userName}! 💡 The barriers to entrepreneurship are lower than ever in 2025.

**Modern Entrepreneurship Advantages:**
- Start a business with $100-1000 (vs. $10K+ in the past)
- Global market access from day one
- AI assistants for customer service, marketing, and operations
- Online courses and communities for learning
- Subscription economy enables predictable revenue

**Low-Risk Business Ideas for 2025:**
- **Digital Consulting** - Leverage your existing expertise
- **Online Courses** - Teach skills you already have
- **Newsletter/Content Business** - Build audience, monetize later
- **Dropshipping/Print-on-Demand** - Sell without inventory
- **Virtual Services** - Social media management, bookkeeping, design

**High-Growth Business Opportunities:**
- **AI-Powered Services** - Use AI to solve traditional problems
- **Sustainability Solutions** - Green products and services
- **Health and Wellness** - Aging population creates demand
- **Remote Work Tools** - Software and services for distributed teams
- **Personal Finance** - Apps and services for financial literacy

**The Entrepreneur's Journey:**
**Months 1-3**: Idea validation and MVP development
**Months 4-6**: First customers and product iterations
**Months 7-12**: Growth and system building
**Year 2+**: Scaling and potential expansion

**Side Hustle to Full Business:**
Start your business while keeping your day job. This reduces financial pressure and gives you time to validate your concept. Many successful entrepreneurs started this way.

**Common Entrepreneur Mistakes:**
- Building product before finding customers
- Trying to be perfect instead of shipping early
- Ignoring finances and cash flow
- Working IN the business instead of ON the business
- Not asking for help or mentorship

**Building Your Network:**
- Join local entrepreneur meetups
- Connect with other founders online
- Find mentors in your industry
- Build relationships with potential customers
- Engage with startup accelerators

What type of business problem are you passionate about solving? This often points to the best entrepreneurial opportunity for you.`
      ];
      
      return entrepreneurshipResponses[Math.floor(Math.random() * entrepreneurshipResponses.length)];
    }

    // Recent Graduate and Entry-Level Career Responses
    if (message.includes('recent graduate') || message.includes('entry level') || message.includes('new graduate') || message.includes('first job') || message.includes('college graduate')) {
      const graduateResponses = [
        `Congratulations on your graduation, ${userName}! 🎓 Entering the job market in 2025 comes with unique opportunities and challenges.

**📊 2025 Graduate Job Market:**
- Entry-level hiring up 23% from 2024
- Average starting salary: $55K (varies by field)
- 76% of employers struggling to find qualified candidates
- Skills-based hiring more important than GPA
- Remote/hybrid options standard for most roles

**Top Entry-Level Career Paths:**
- **Technology**: Software development, data analysis, UX design ($60K-85K)
- **Healthcare**: Nursing, medical technology, therapy ($50K-75K)
- **Finance**: Financial analyst, credit analyst, operations ($55K-70K)
- **Marketing**: Digital marketing, content creation, analytics ($45K-65K)
- **Sales**: Account executive, business development, customer success ($50K-80K+)

**Landing Your First Job Strategy:**
1. **Tailor Your Resume** - Match keywords to job descriptions
2. **Build a Portfolio** - Show real work, not just academic projects
3. **Network Actively** - 70% of jobs are never publicly posted
4. **Practice Interviewing** - Prepare STAR method examples
5. **Be Flexible** - Consider contract-to-hire and temporary positions

**Skills That Matter Most to Employers:**
- **Communication Skills** - Written and verbal clarity
- **Problem-Solving** - Critical thinking and creativity
- **Adaptability** - Learning new tools and processes quickly
- **Digital Literacy** - Comfort with technology and software
- **Collaboration** - Working effectively in teams

**Overcoming "Entry-Level Experience Required" Paradox:**
- **Internships** - Even unpaid ones provide experience
- **Volunteer Work** - Nonprofit projects show initiative
- **Personal Projects** - Build something relevant to your field
- **Freelance Work** - Small gigs demonstrate real-world skills
- **Certifications** - Industry credentials show commitment

**First Job Salary Negotiation:**
- Research market rates for your role and location
- Don't accept the first offer immediately
- Negotiate the entire package (benefits, vacation, development)
- If salary is fixed, ask for additional responsibilities or training
- Remember: Your first job salary sets the baseline for future roles

**Career Growth Timeline:**
- **Year 1**: Learn systems, build relationships, prove reliability
- **Year 2**: Take on additional responsibilities, identify strengths
- **Year 3**: Consider internal moves or external opportunities
- **Years 4-5**: Position yourself for promotion or strategic career change

What field did you study, and what type of work environment appeals to you most?`,

        `Welcome to your career journey, ${userName}! 🌟 Being a recent graduate in 2025 is actually a great position to be in.

**Why 2025 is Great for New Graduates:**
- Companies are investing heavily in entry-level talent
- Remote work options provide access to global opportunities
- Technology makes it easier to build skills and showcase work
- Diverse career paths beyond traditional degree requirements
- Strong job market with low unemployment

**The Modern Job Search (2025 Edition):**
- **Online Applications**: Only 20% success rate
- **Networking**: 50-70% of jobs come from connections
- **Company Direct Applications**: 30% success rate
- **Recruiters**: 25% success rate for qualified candidates
- **Social Media**: LinkedIn increasingly important

**Building Your Professional Brand:**
1. **LinkedIn Optimization** - Professional photo, compelling headline, detailed experience
2. **Portfolio Website** - Showcase projects and achievements
3. **GitHub Profile** - If technical, show code samples
4. **Professional Email** - firstname.lastname@gmail.com format
5. **Online Presence** - Clean up social media profiles

**Entry-Level Job Application Strategy:**
- Apply to 10-15 positions per week consistently
- Follow up on applications after 1 week
- Customize each application for the specific role
- Apply within 48 hours of job posting (if possible)
- Track applications in a spreadsheet

**Interview Preparation for New Graduates:**
- **Research the Company** - Mission, values, recent news, competitors
- **Prepare STAR Examples** - Situation, Task, Action, Result stories
- **Practice Common Questions** - "Tell me about yourself," strengths/weaknesses
- **Prepare Questions** - Ask about growth opportunities, team culture
- **Mock Interviews** - Practice with friends, family, or career services

**Managing Job Search Stress:**
- Set daily goals (applications, networking, skill building)
- Celebrate small wins (interviews, positive feedback)
- Maintain work-life balance during the search
- Join job search support groups or communities
- Remember: Rejection is normal and not personal

**Alternative Paths if Traditional Jobs Aren't Working:**
- **Gig Economy** - Build experience while earning income
- **Startup Internships** - More responsibility, equity potential
- **Bootcamps/Certifications** - Add specific skills to your resume
- **Volunteer Leadership** - Demonstrate management capabilities
- **Freelance Projects** - Build portfolio and client relationships

What's your biggest concern about starting your career? Job search process, salary expectations, or finding the right fit?`
      ];
      
      return graduateResponses[Math.floor(Math.random() * graduateResponses.length)];
    }

    // Salary and Compensation Questions
    if (message.includes('salary') || message.includes('compensation') || message.includes('pay') || message.includes('income') || message.includes('money')) {
      const salaryResponses = [
        `Salary discussions are crucial for career planning, ${userName}! 💰 Let me share 2025 compensation insights and negotiation strategies.

**📈 2025 Salary Trends:**
- Average salary increase: 4.1% (above inflation)
- Remote workers earn 8.5% more than office-only workers
- Tech workers saw 12% average increase from 2024
- Healthcare and finance also experiencing strong growth
- Skills-based roles command premium over experience-only

**High-Paying Career Fields (2025 Average Salaries):**
- **Technology**: $85K-150K (Software Engineers, Data Scientists)
- **Healthcare**: $75K-200K+ (Nurses to Specialists)
- **Finance**: $70K-180K (Analysts to Investment Bankers)
- **Sales**: $60K-200K+ (Base + Commission structures)
- **Management Consulting**: $90K-250K+ (Analyst to Partner track)

**Salary Negotiation Strategy:**
1. **Research Market Rates** - Use Glassdoor, Levels.fyi, PayScale
2. **Document Your Value** - Quantify achievements and impact
3. **Practice Your Pitch** - Rehearse salary conversation
4. **Consider Total Compensation** - Benefits, equity, vacation, development
5. **Time It Right** - During review cycles or after major wins

**When to Negotiate:**
- **New Job Offers** - Always negotiate (90% of employers expect it)
- **Annual Reviews** - If you've exceeded expectations
- **Role Changes** - When taking on additional responsibilities
- **Market Changes** - If your skills are suddenly in higher demand
- **After Major Wins** - Following successful projects or achievements

**What Drives Higher Salaries:**
- **High-Demand Skills** - AI/ML, cloud computing, cybersecurity
- **Leadership Experience** - Managing teams and budgets
- **Revenue Impact** - Directly contributing to company profits
- **Specialization** - Expertise in niche, valuable areas
- **Location** - Major tech hubs still pay premiums (even for remote)

**Beyond Base Salary:**
- **Equity/Stock Options** - Can be worth 20-50% of base salary
- **Bonuses** - Performance, signing, retention bonuses
- **Benefits** - Health, dental, 401k matching, life insurance
- **Perks** - Learning budget, home office allowance, flexible PTO
- **Career Development** - Training, conference attendance, mentorship

**Salary by Experience Level:**
- **Entry Level (0-2 years)**: $45K-70K
- **Mid-Level (3-5 years)**: $65K-110K  
- **Senior Level (6-10 years)**: $95K-160K
- **Leadership (10+ years)**: $130K-300K+

*Note: Ranges vary significantly by industry, location, and company size*

What specific role or industry salary information would be most helpful for your career planning?`,

        `Understanding compensation is key to career success, ${userName}! 💸 Let me break down the current salary landscape and how to maximize your earning potential.

**The Reality of Salary Growth:**
- Most people increase their salary 50-100% every 5-7 years
- Job changes typically yield 10-20% salary increases
- Internal promotions average 3-5% increases
- Skill development can accelerate salary growth significantly
- Geographic arbitrage (remote work from lower-cost areas) can effectively increase purchasing power

**Highest ROI Skills for Salary Growth:**
- **AI/Machine Learning**: +25% salary premium
- **Cloud Computing (AWS/Azure)**: +20% premium
- **Data Analysis**: +15% premium
- **Project Management**: +12% premium
- **Digital Marketing**: +10% premium

**Industry Salary Comparison (2025):**
**Technology** 🏆
- Software Engineer: $95K-180K
- Data Scientist: $110K-190K
- Product Manager: $120K-200K
- Cybersecurity: $100K-175K

**Finance** 💼
- Financial Analyst: $65K-95K
- Investment Banking: $100K-250K+
- Financial Advisor: $60K-150K
- Risk Manager: $85K-140K

**Healthcare** 🏥
- Registered Nurse: $70K-95K
- Physician Assistant: $110K-140K
- Healthcare IT: $75K-120K
- Physical Therapist: $85K-100K

**Salary Negotiation Mistakes to Avoid:**
- Accepting first offer without negotiation
- Only focusing on base salary (ignore total comp)
- Negotiating via email instead of phone/video
- Not researching market rates beforehand
- Making demands instead of collaborative discussion

**Building Your Case for Higher Pay:**
1. **Document Achievements** - Keep a "wins" journal throughout the year
2. **Quantify Impact** - Use numbers, percentages, dollar amounts
3. **Market Research** - Know what others in your role earn
4. **Skill Development** - Continuously add valuable capabilities
5. **Network Intelligence** - Stay informed about industry standards

**When Salary Isn't Negotiable:**
- Ask for additional vacation days
- Request professional development budget
- Negotiate flexible work arrangements
- Seek title change for future opportunities
- Ask for equity or profit-sharing

Are you preparing for a salary negotiation, researching career fields, or planning your earning potential growth?`
      ];
      
      return salaryResponses[Math.floor(Math.random() * salaryResponses.length)];
    }

    // Industry Trends and Future of Work
    if (message.includes('industry trends') || message.includes('future of work') || message.includes('job market') || message.includes('employment outlook') || message.includes('career outlook')) {
      const trendsResponses = [
        `The job market in 2025 is fascinating, ${userName}! 🔮 Let me share the key trends shaping careers right now.

**🚀 Major Industry Trends in 2025:**

**AI Integration Revolution:**
- 85% of companies now use AI tools in daily operations
- New job categories: AI Trainers, Algorithm Auditors, Human-AI Interaction Designers
- Traditional roles evolving: Accountants use AI for analysis, Writers collaborate with AI for content
- Workers who embrace AI tools are 40% more productive

**The Great Reshuffling Continues:**
- 67% of workers have changed jobs in the past 3 years
- Skills-based hiring over degree requirements
- Project-based work and gig economy growth
- Location independence becoming standard expectation

**Green Economy Explosion:**
- $2.5 trillion invested in clean energy and sustainability
- New careers: Carbon Footprint Analysts, Renewable Energy Technicians, Sustainability Consultants
- Every industry adding ESG (Environmental, Social, Governance) roles
- Green skills premium: 15-25% higher salaries

**Healthcare Transformation:**
- Aging population driving massive demand
- Telemedicine and digital health expanding rapidly
- Mental health services growing 300% since 2020
- Healthcare AI creating new diagnostic and treatment roles

**Future-Proof Career Strategies:**
1. **Develop AI Collaboration Skills** - Learn to work WITH AI, not against it
2. **Focus on Human-Centric Skills** - Creativity, empathy, complex problem-solving
3. **Embrace Continuous Learning** - Average skill half-life is now 2-5 years
4. **Build Adaptability** - Industries change rapidly
5. **Cultivate Cross-Functional Skills** - Blend technical and business capabilities

**Jobs Growing Fastest (2025-2030):**
- **Data Scientists**: +36% growth
- **Software Developers**: +25% growth  
- **Digital Marketing Specialists**: +23% growth
- **Cybersecurity Analysts**: +35% growth
- **Healthcare Support Specialists**: +18% growth

**Jobs Being Transformed (Not Eliminated):**
- **Accountants** → Strategic Business Advisors with AI tools
- **Teachers** → Learning Experience Designers with virtual reality
- **Lawyers** → Legal Strategists with AI research assistants
- **Doctors** → Precision Medicine Specialists with AI diagnostics

**Geographic Trends:**
- **Tier 2 Cities** gaining talent from expensive metros
- **International Remote Work** becoming more common
- **Rural Areas** benefiting from digital nomad movement
- **Developing Countries** joining global talent pool

What industry or trend interests you most? I can dive deeper into specific opportunities!`,

        `The future of work is being rewritten right now, ${userName}! 🌟 Here's what smart career professionals need to know about 2025 and beyond.

**The New Career Paradigm:**
- **Portfolio Careers** - Multiple income streams becoming normal
- **Skill Stacking** - Combining 2-3 complementary skills for unique value
- **Project-Based Work** - More companies hiring for specific outcomes
- **Continuous Reinvention** - Expect 3-5 major career pivots in your lifetime

**Technology's Impact on Jobs:**
**Jobs AI Will Handle More:**
- Data entry and basic analysis
- Simple customer service queries
- Basic financial calculations
- Routine scheduling and coordination

**Jobs Becoming More Important:**
- Creative problem solving
- Emotional intelligence and counseling
- Strategic thinking and planning
- Complex communication and negotiation
- Innovation and entrepreneurship

**Emerging Job Categories:**
- **Prompt Engineers** - Optimize AI interactions ($80K-150K)
- **Digital Wellness Coaches** - Help people manage technology addiction
- **Virtual Reality Architects** - Design immersive experiences
- **Sustainability Analysts** - Measure and improve environmental impact
- **Human-AI Collaboration Specialists** - Optimize human-machine teamwork

**The Skills That Will Always Matter:**
1. **Critical Thinking** - Analyzing complex problems
2. **Creativity** - Generating innovative solutions
3. **Emotional Intelligence** - Understanding and managing relationships
4. **Adaptability** - Thriving in changing environments
5. **Communication** - Clearly conveying ideas across different audiences

**Industry Disruption Timeline:**
**Already Happening (2025):**
- Retail automation and cashierless stores
- AI-powered customer service and chatbots
- Remote work as default for knowledge workers
- Gig economy expanding beyond driving/delivery

**Coming Soon (2026-2028):**
- Autonomous vehicles affecting transportation jobs
- AI assistants handling routine professional tasks
- Virtual reality transforming education and training
- 3D printing disrupting manufacturing

**Preparing for Career Future:**
- **Stay Curious** - Read industry publications, take courses
- **Network Strategically** - Build relationships across industries
- **Experiment Regularly** - Try new tools, methods, approaches
- **Document Learning** - Keep track of skills and experiences
- **Plan Multiple Scenarios** - Have backup plans for your career

**The Most Recession-Proof Careers:**
- Healthcare (aging population)
- Technology (digital transformation)
- Education (continuous learning need)
- Food and agriculture (essential services)
- Skilled trades (can't be outsourced)

What aspect of the future workforce interests or concerns you most? I can help you prepare for specific changes coming to your industry.`
      ];
      
      return trendsResponses[Math.floor(Math.random() * trendsResponses.length)];
    }

    // Work-Life Balance and Professional Development
    if (message.includes('work life balance') || message.includes('burnout') || message.includes('stress') || message.includes('professional development') || message.includes('career growth')) {
      const workLifeResponses = [
        `Work-life balance is more important than ever, ${userName}! 🌱 The pandemic fundamentally changed how we think about career satisfaction.

**📊 2025 Work-Life Balance Reality:**
- 78% of workers consider work-life balance when job searching
- Companies with good balance have 40% lower turnover
- Remote work improved work-life balance for 83% of workers
- "Quiet quitting" trend shows importance of boundaries
- Mental health benefits now standard at most companies

**Signs You Need Better Work-Life Balance:**
- Working more than 50 hours per week consistently
- Checking email/messages outside work hours
- Feeling guilty when not working
- Difficulty sleeping due to work stress
- Strained personal relationships
- Neglecting health and self-care

**Strategies for Better Balance:**
1. **Set Clear Boundaries** - Define work hours and stick to them
2. **Create Transition Rituals** - Separate work and personal time
3. **Use Technology Wisely** - Turn off notifications after hours
4. **Prioritize Ruthlessly** - Focus on high-impact activities
5. **Take Real Vacations** - Completely disconnect from work

**Professional Development in a Balanced Way:**
- **Micro-Learning** - 15-30 minutes daily instead of weekend marathons
- **Learning During Work** - Ask for training budget and time
- **Skill-Building Projects** - Combine learning with real work
- **Mentorship** - Regular check-ins with experienced professionals
- **Industry Events** - Networking that counts as professional development

**Career Growth Without Burnout:**
- **Quality Over Quantity** - Focus on high-impact contributions
- **Delegate and Collaborate** - Don't try to do everything yourself
- **Regular Career Check-ins** - Monthly self-assessment of goals
- **Side Projects** - Explore interests without job pressure
- **Internal Mobility** - Grow within current company first

**Companies Known for Great Work-Life Balance:**
- **Microsoft** - Flexible PTO, wellness programs
- **Salesforce** - Ohana culture, volunteer time off
- **Google** - On-site amenities, mental health support
- **Patagonia** - Environmental mission, flexible schedules
- **Buffer** - Transparent culture, remote-first

**Negotiating Work-Life Balance:**
- **Flexible Hours** - Start earlier/later to avoid commute
- **Remote Work Days** - 2-3 days per week hybrid
- **Compressed Schedules** - Four 10-hour days instead of five 8-hour days
- **Sabbatical Policies** - Extended time off for personal projects
- **Mental Health Days** - Additional PTO for wellness

**Building a Sustainable Career:**
Your career should enhance your life, not consume it. The most successful professionals maintain energy and enthusiasm through balance, not just grinding harder.

What specific work-life balance challenges are you facing? I can help you develop strategies for your situation.`,

        `Professional development and work-life balance aren't opposing forces, ${userName}! 🎯 The key is intentional, strategic growth.

**The New Professional Development Paradigm:**
- **Continuous Learning** - Small, consistent efforts over intense bursts
- **Experiential Learning** - Learn through doing, not just studying
- **Network-Based Learning** - Learn from peers and mentors
- **Cross-Functional Skills** - Blend technical and soft skills
- **Personal Brand Building** - Share your learning journey publicly

**High-Impact Professional Development Activities:**
1. **Industry Conferences** - 2-3 per year for networking and trends
2. **Online Courses** - Platforms like Coursera, LinkedIn Learning, Udemy
3. **Professional Certifications** - Add credibility to your expertise
4. **Mentorship Relationships** - Both being mentored and mentoring others
5. **Speaking/Writing** - Share knowledge to establish expertise

**Learning ROI by Activity:**
- **On-the-Job Projects**: 90% skill retention, immediate application
- **Mentorship**: 80% retention, personalized guidance
- **Peer Learning Groups**: 70% retention, social accountability
- **Online Courses**: 60% retention, flexible timing
- **Reading/Research**: 50% retention, foundational knowledge

**Professional Development Budget:**
Most companies allocate $1,000-3,000 annually per employee. Use it strategically:
- **40%** - Technical skills relevant to current role
- **30%** - Leadership and soft skills
- **20%** - Industry trends and future skills
- **10%** - Personal interests that might become professional

**Career Growth Timeline (Sustainable Approach):**
**Year 1**: Master current role, identify growth areas
**Year 2**: Develop 1-2 new skills, take on stretch projects
**Year 3**: Seek promotion or new opportunities
**Year 4**: Mentor others, establish expertise reputation
**Year 5**: Consider leadership roles or specialization

**Avoiding Professional Development Burnout:**
- **Set Learning Goals** - 1-2 major skills per year maximum
- **Apply Immediately** - Use new skills in real projects
- **Track Progress** - Document what you've learned and applied
- **Connect with Others** - Join communities around your learning areas
- **Celebrate Wins** - Acknowledge progress and achievements

**Building Your Professional Brand:**
- **LinkedIn Activity** - Share insights, comment thoughtfully
- **Industry Participation** - Join professional associations
- **Content Creation** - Blog posts, videos, podcasts about your expertise
- **Speaking Opportunities** - Present at conferences or internal meetings
- **Volunteer Leadership** - Lead projects in professional organizations

**The 70-20-10 Learning Model:**
- **70%** - On-the-job experiences and challenges
- **20%** - Learning from others (mentoring, coaching)
- **10%** - Formal education and training

What professional development goals are most important for your career right now?`
      ];
      
      return workLifeResponses[Math.floor(Math.random() * workLifeResponses.length)];
    }

    // Career Transition and Change Responses
    if (message.includes('transition') || message.includes('change career') || message.includes('switch') || message.includes('pivot')) {
      const transitionResponses = [
        `Career transitions can be both exciting and overwhelming, ${userName}. I'm ${personalityName}, and I specialize in helping professionals navigate major career pivots. 🔄

**The Reality of Career Change:**
Most successful transitions take 6-18 months of intentional preparation. You're not starting from zero - you're redirecting existing skills toward new opportunities.

**Strategic Transition Framework:**
1. **Skills Translation** - Identify transferable skills from your current role
2. **Bridge Building** - Find roles that blend your current expertise with new interests  
3. **Proof of Concept** - Create projects or volunteer work in your target field
4. **Network Expansion** - Connect with people already doing what you want to do
5. **Financial Planning** - Prepare for potential income adjustments during transition

**Common Transition Paths I've Seen:**
- Teacher → Instructional Designer → UX Designer
- Accountant → Data Analyst → Product Manager  
- Sales Rep → Customer Success → Product Marketing
- Engineer → Technical Writer → Developer Relations

What field are you considering moving into? Understanding your "why" behind the change helps me suggest the most strategic path forward.`,

        `I love helping people with career transitions! 🌟 You're asking one of the most important questions of your professional life.

**Truth About Career Change:**
It's rarely a straight line, and that's actually good news. Most people don't have just one "perfect" career - they have several fulfilling chapters.

**Before We Plan Your Transition:**
- What's pushing you away from your current field?
- What's pulling you toward something new?
- What aspects of your current work do you want to keep?
- What would you do even if you weren't paid for it?

**Practical Transition Strategies:**
1. **The Side Project Approach** - Test new fields while keeping current income
2. **The Education Bridge** - Take courses/certifications to build credibility
3. **The Internal Move** - Find new roles within your current company
4. **The Gradual Shift** - Move to adjacent roles, then make bigger jumps

I've helped hundreds of professionals successfully transition. The key is creating a bridge from where you are to where you want to be, not jumping blindly.

What's motivating your desire for change? Let's start there and build a realistic roadmap.`
      ];
      
      return transitionResponses[Math.floor(Math.random() * transitionResponses.length)];
    }

    // Interview and Job Search Responses  
    if (message.includes('interview') || message.includes('job search') || message.includes('resume') || message.includes('application')) {
      const jobSearchResponses = [
        `Job searching can feel like a full-time job itself, ${userName}! 📝 I'm ${personalityName}, and I've helped countless professionals land their dream roles.

**Current Job Market Insights:**
- Hiring processes are taking longer (average 4-6 rounds)
- Companies are focusing heavily on cultural fit
- Remote/hybrid work is now standard expectation
- Skills-based hiring is becoming more common than degree requirements

**Interview Preparation Strategy:**
1. **Research Deep** - Company values, recent news, key challenges in their industry
2. **STAR Method Mastery** - Situation, Task, Action, Result for behavioral questions
3. **Technical Prep** - Practice relevant skills, coding challenges, case studies
4. **Question Arsenal** - Prepare thoughtful questions that show genuine interest

**Common Interview Mistakes I See:**
- Not having specific examples ready
- Failing to connect your experience to their needs  
- Asking questions easily answered by their website
- Not following up appropriately

**Resume Optimization:**
Your resume should tell a story of progressive achievement, not just list job duties. Use metrics wherever possible - "increased efficiency" becomes "reduced processing time by 40%."

What stage of the job search are you in? Are you getting interviews but not offers, or struggling to get that first callback?`,

        `The job search process has definitely evolved, ${userName}! 🎯 As someone who's been in career counseling for years, I can tell you the fundamentals remain the same, but the tactics have changed.

**What's Working in Today's Market:**
- LinkedIn networking (but done authentically, not spam)
- Referrals still account for 30-50% of hires
- Portfolio/project-based applications (show, don't just tell)
- Following up strategically (not desperately)

**Interview Success Framework:**
1. **Storytelling Preparation** - Have 5-7 STAR stories ready covering different competencies
2. **Company Connection** - Understand their mission and how you fit
3. **Questions That Impress** - Ask about challenges, growth, team dynamics
4. **Follow-up Excellence** - Thank you note + something valuable (article, idea, connection)

**Red Flags to Watch For:**
- Vague job descriptions
- Rushed hiring processes  
- Reluctance to discuss compensation
- High turnover in the role/team

**Salary Negotiation Reality:**
Most companies expect negotiation. Not negotiating can actually signal lack of confidence. Research market rates, know your value, and remember - the worst they can say is no.

Are you dealing with interview anxiety, resume optimization, or negotiation strategy? Each requires different tactics.`
      ];
      
      return jobSearchResponses[Math.floor(Math.random() * jobSearchResponses.length)];
    }

    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const greetingResponses = [
        `Hi ${userName}! I'm ${personalityName}, your dedicated career counselor. 🌟 

${personality?.responseStyle?.includes('warm') ? 'I\'m so glad you\'re here! ' : 'Welcome to your career development journey. '}${memory?.conversationHistory.length ? 'It\'s great to continue our conversation. ' : 'I\'m excited to get to know you and help you achieve your career goals. '}

I specialize in helping professionals like you with:
- **Career Path Discovery** - Finding roles that align with your passions
- **Skill Development Planning** - Building expertise in high-demand areas  
- **Professional Growth Strategies** - Advancing your career effectively
- **Industry Insights** - Understanding market trends and opportunities

What career challenge or goal would you like to focus on?`,

        `Hey ${userName}! 👋 I'm ${personalityName}, and I'm genuinely excited to work with you on your career journey.

Whether you're just starting out, looking to make a change, or aiming for that next big step up, I'm here to help you navigate it strategically.

**What I Can Help You With Today:**
- Identifying your ideal career path based on your strengths and interests
- Building a skill development plan that gets you noticed
- Networking strategies that actually work
- Interview preparation that builds confidence
- Salary negotiation tactics
- Creating a professional brand that stands out

I believe every person has unique talents and the right career path is about finding where those talents create the most value (and satisfaction) for you.

What's on your mind career-wise? Are you exploring options, facing a specific challenge, or ready to level up?`,

        `Welcome ${userName}! 🚀 I'm ${personalityName}, your AI career strategist, and I'm here to help you unlock your professional potential.

The career landscape in 2025 is full of opportunities, but it can also feel overwhelming. That's where I come in - to help you cut through the noise and create a clear path forward.

**My Expertise Areas:**
- **🎯 Career Direction** - Discover what truly fits your skills and interests
- **📈 Skill Strategy** - Build capabilities that employers actually want
- **💼 Job Market Navigation** - Understand what's hot and what's not
- **🤝 Professional Networking** - Build relationships that open doors
- **💰 Compensation Optimization** - Get paid what you're worth

**Quick Question to Get Started:**
Are you looking to:
- Explore new career paths?
- Advance in your current field?
- Make a complete career change?
- Optimize your job search strategy?
- Develop specific skills?

Let me know what's most pressing for you right now!`,

        `Hello there, ${userName}! ✨ I'm ${personalityName}, and I'm passionate about helping professionals like you achieve career success and satisfaction.

**A Little About My Approach:**
I believe career development should be strategic, personalized, and realistic. No cookie-cutter advice here - we'll create a plan that fits YOUR unique situation, goals, and timeline.

**What Makes Our Conversation Different:**
- **Data-Driven Insights** - I stay current with 2025 job market trends
- **Practical Strategies** - Real tactics you can implement immediately  
- **Holistic Perspective** - Balance career growth with life satisfaction
- **Industry Expertise** - Deep knowledge across multiple career fields
- **Supportive Guidance** - Honest feedback delivered with encouragement

**Popular Topics I Help With:**
- Career assessment and self-discovery
- Resume and LinkedIn optimization
- Interview preparation and salary negotiation
- Professional skill development
- Work-life balance strategies
- Industry transition planning

**Ready to Get Started?**
What's your biggest career question or challenge right now? I'm here to provide personalized guidance that actually works in today's job market.

${memory?.userGoals?.length ? `I see we've previously discussed your goals around ${memory.userGoals.slice(-2).join(' and ')}. ` : ''}Let's dive in!`
      ];
      
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }
    
    // Help and guidance responses
    if (message.includes('help') || message.includes('advice') || message.includes('guidance')) {
      const helpResponses = [
        `I'd love to help you, ${userName}! 🤝 

To provide the most valuable guidance, could you share more about:

- Your current career situation or field of interest
- Specific challenges you're facing
- Goals you'd like to achieve in the next 6-12 months
- Any particular areas where you feel stuck

${personality?.specializations ? 'I have particular expertise in ' + personality.specializations.join(', ') + '. ' : ''}What would you like to explore first?`,

        `Absolutely, ${userName}! I'm here to support your career journey. Let's create an action plan together! 🚀

I can assist you with:

- **Assessment & Self-Discovery** - Understanding your strengths and interests
- **Career Exploration** - Researching roles and industries that fit you
- **Skill Gap Analysis** - Identifying what to learn for your target role
- **Networking Strategies** - Building professional connections effectively
- **Interview Preparation** - Presenting your best self to employers
- **Industry Trend Analysis** - Understanding where opportunities are growing

What career challenge or goal would you like to focus on?`
      ];
      
      return helpResponses[Math.floor(Math.random() * helpResponses.length)];
    }
    
    // Handle very short or unclear messages
    if (message.length <= 3 || /^[0-9]+$/.test(message) || message === 'hi' || message === 'hello') {
      const clarificationResponses = [
        `Hi ${userName}! I noticed your message was quite brief. To give you the most helpful career guidance, could you tell me more about what you're looking for? 

For example:
- Are you exploring new career paths?
- Do you need help with skill development?
- Are you preparing for job interviews?
- Would you like career assessment recommendations?

What's on your mind regarding your career journey?`,

        `Hello ${userName}! I'd love to help you with your career development. Since your message was short, let me ask: what specific career topic interests you most right now?

**Popular areas I help with:**
- 🎯 Career direction and planning
- 📈 Skill building and certifications  
- 💼 Job search and interview prep
- 📊 Career assessments and personality insights

What would be most valuable for your career growth today?`,

        `Hey ${userName}! I'm here to provide personalized career advice. To give you the best guidance, could you share more about your current situation?

**I can help you with:**
- Discovering career paths that match your interests
- Building relevant skills for your target roles
- Creating career action plans
- Understanding industry trends and opportunities

What career challenge or goal would you like to focus on?`
      ];
      
      return clarificationResponses[Math.floor(Math.random() * clarificationResponses.length)];
    }
    
    // Career exploration responses
    if (message.includes('career') || message.includes('profession')) {
      return `Hi ${userName}! I'm ${personalityName}, and I'm excited to help you explore career opportunities. ${personality?.responseStyle.includes('motivational') ? '🚀' : ''} 

Based on ${memory?.mentionedTopics.length ? 'our previous discussions about ' + memory.mentionedTopics.slice(-2).join(' and ') : 'what you\'ve shared'}, let me guide you through some career exploration strategies:

1. **Self-Assessment**: Understanding your strengths, interests, and values
2. **Market Research**: Exploring growing industries and opportunities
3. **Skill Development**: Identifying key skills for your target roles
4. **Networking**: Building professional connections in your field

What specific aspect of career exploration interests you most right now?`;
    }

    // Skill development responses
    if (message.includes('skill') || message.includes('learn')) {
      return `Great question about skill development, ${userName}! ${personality?.traits.includes('energetic') ? '💪' : ''} 

${personality?.responseStyle.includes('action-oriented') ? 'Let\'s create an action plan for your skill development:' : 'Here\'s a thoughtful approach to building your skills:'}

**High-Demand Skills to Consider:**
- Digital literacy and data analysis
- Communication and presentation skills
- Problem-solving and critical thinking
- Industry-specific technical skills

**Development Strategies:**
1. Online courses and certifications
2. Hands-on projects and portfolios
3. Mentorship and peer learning
4. Professional workshops and conferences

${memory?.userGoals.length ? 'Given your goals of ' + memory.userGoals.join(' and ') + ', I\'d recommend focusing on...' : 'To give you more targeted advice, what career field are you most interested in?'}`;
    }

    // Assessment and evaluation responses
    if (message.includes('assess') || message.includes('test') || message.includes('evaluat')) {
      return `Assessment is a crucial step in career planning, ${userName}! ${personality?.traits.includes('analytical') ? '📊' : ''} 

${personality?.name === 'Career Counselor Riley' ? 'Let me walk you through a comprehensive assessment approach:' : 'Here are some valuable assessment tools to consider:'}

**Types of Career Assessments:**
1. **Personality Assessments** - Understanding your work style
2. **Interest Inventories** - Discovering what motivates you
3. **Skills Assessments** - Identifying your strengths
4. **Values Clarification** - What matters most in your career

**Next Steps:**
- Complete our platform's comprehensive career assessment
- Reflect on the results with guided questions
- Discuss findings with a mentor or counselor

${memory?.personalityInsights ? 'Based on your previous assessment insights, ' : ''}Would you like to start with a specific type of assessment, or shall we begin with a general career exploration quiz?`;
    }

    // Default supportive response with variation
    const responses = [
      `Hello ${userName}! I'm ${personalityName}, ${personality?.responseStyle || 'and I\'m here to support your career journey'}. ${personality?.traits.includes('encouraging') ? '✨' : ''}

${memory?.conversationHistory.length ? 'I remember we\'ve been discussing your career development. ' : ''}I'm here to help you with:

- **Career Exploration** - Discovering new opportunities
- **Skill Development** - Building valuable capabilities  
- **Goal Setting** - Creating actionable career plans
- **Industry Insights** - Understanding market trends

${personality?.specializations ? 'My specializations include ' + personality.specializations.join(', ') + '. ' : ''}

What would you like to explore today? Feel free to share your current career situation or any specific questions you have!`,

      `Hi ${userName}! I'm ${personalityName}, your career guidance companion. ${personality?.traits.includes('supportive') ? '🤝' : ''}

${userMessage ? `I see you mentioned "${userMessage}". ` : ''}Let me help you navigate your career journey with personalized advice.

**I can assist you with:**
- Exploring career paths that match your interests
- Developing in-demand skills for your field
- Creating a strategic career roadmap
- Understanding current job market trends

${memory?.userGoals.length ? 'Considering your previous goals, ' : ''}what specific area would you like to focus on today?`,

      `Welcome ${userName}! I'm ${personalityName}, ${personality?.traits.includes('experienced') ? 'an experienced' : 'a dedicated'} career counselor. ${personality?.traits.includes('practical') ? '💼' : ''}

${memory?.mentionedTopics.length ? 'Building on our previous conversations about ' + memory.mentionedTopics.slice(-2).join(' and ') + ', ' : ''}I'm here to provide tailored career guidance.

**Areas I specialize in:**
- Career transition strategies
- Professional skill assessment
- Interview and networking preparation
- Long-term career planning

What career challenge or opportunity would you like to discuss first?`
    ];

    // Select a random response or based on conversation history
    const responseIndex = memory?.conversationHistory.length ? 
      memory.conversationHistory.length % responses.length : 
      Math.floor(Math.random() * responses.length);
    
    return responses[responseIndex];
  }

  private buildSystemMessage(context?: any): AIMessage {
    let systemContent = `You are an expert career counselor AI assistant helping students with career guidance, assessments, and professional development. 

Key Guidelines:
- Provide personalized, actionable career advice
- Be encouraging and supportive
- Ask clarifying questions to better understand goals
- Reference relevant career paths, skills, and opportunities
- Suggest assessments, mentorship, and resources when appropriate`;

    if (context?.userProfile) {
      systemContent += `\n\nUser Profile Context:`;
      if (context.userProfile.educationLevel) {
        systemContent += `\n- Education Level: ${context.userProfile.educationLevel}`;
      }
      if (context.userProfile.interests) {
        systemContent += `\n- Interests: ${context.userProfile.interests.join(', ')}`;
      }
      if (context.userProfile.currentGoals) {
        systemContent += `\n- Current Goals: ${context.userProfile.currentGoals.join(', ')}`;
      }
    }

    if (context?.previousAssessments?.length > 0) {
      systemContent += `\n\nPrevious Assessment Results:`;
      context.previousAssessments.forEach((assessment: any, index: number) => {
        systemContent += `\n- Assessment ${index + 1}: ${assessment.type} - Score: ${assessment.score}`;
      });
    }

    return {
      role: 'system',
      content: systemContent
    };
  }

  private async callOpenAI(messages: AIMessage[]): Promise<string> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.openaiModel,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
  }

  private async callAnthropic(messages: AIMessage[]): Promise<string> {
    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.anthropicModel,
        max_tokens: 500,
        temperature: 0.7,
        system: systemMessage?.content,
        messages: conversationMessages,
      },
      {
        headers: {
          'x-api-key': this.anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return response.data.content[0]?.text || 'I apologize, but I could not generate a response at this time.';
  }

  private async callDeepSeek(messages: AIMessage[]): Promise<string> {
    this.logger.log(`🔑 [AI SERVICE] Calling DeepSeek API with key: ${this.deepseekApiKey ? 'Valid' : 'Missing'}`);
    this.logger.log(`📡 [AI SERVICE] DeepSeek Model: ${this.deepseekModel}`);
    
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: this.deepseekModel,
          messages,
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      this.logger.log(`✅ [AI SERVICE] DeepSeek API response received`);
      this.logger.log(`📋 [AI SERVICE] Response data: ${JSON.stringify(response.data, null, 2)}`);
      return response.data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      this.logger.error(`❌ [AI SERVICE] DeepSeek API Error:`, error.response?.data || error.message);
      throw error; // Re-throw to trigger fallback
    }
  }

  private async callGptOss(messages: AIMessage[]): Promise<string> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.gptOssModel,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.gptOssApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
  }

  private generateMockResponse(message: string, context?: any): string {
    const lowerMessage = message.toLowerCase();
    
    // Career-focused responses
    if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      return `Based on your interests in career development, I'd recommend exploring roles that align with your skills and passions. ${context?.userProfile?.educationLevel ? `With your ${context.userProfile.educationLevel} background, ` : ''}there are many exciting paths to consider. What specific field interests you most? I can help create a personalized roadmap.`;
    }
    
    if (lowerMessage.includes('assessment') || lowerMessage.includes('test')) {
      return `Career assessments are excellent tools for self-discovery! ${context?.previousAssessments?.length > 0 ? `I see you've completed ${context.previousAssessments.length} assessment(s) already. ` : ''}I can help you understand assessment results and how they relate to potential career paths. Would you like me to recommend specific assessments or analyze your previous results?`;
    }
    
    if (lowerMessage.includes('mentor') || lowerMessage.includes('guidance')) {
      return `Finding the right mentor can be transformative for your career! Based on your profile, I can recommend mentors who specialize in your areas of interest. What specific expertise or industry knowledge are you seeking from a mentor?`;
    }

    if (lowerMessage.includes('skills') || lowerMessage.includes('learn')) {
      return `Skill development is crucial for career success! I can help you identify key skills for your target career path and suggest learning resources. What skills are you most interested in developing, or what career field are you targeting?`;
    }

    if (lowerMessage.includes('salary') || lowerMessage.includes('compensation')) {
      return `Understanding compensation is important for career planning. Salaries vary by location, experience, and industry. I can provide insights about typical salary ranges for different roles and help you negotiate effectively. What specific role or industry are you curious about?`;
    }
    
    // Generic response with context awareness
    let response = `I understand you're asking about "${message}". `;
    
    if (context?.userProfile) {
      response += `Based on your profile${context.userProfile.educationLevel ? ` and ${context.userProfile.educationLevel} background` : ''}, `;
    }
    
    response += `I'm here to help you with career guidance, assessment insights, mentorship connections, and skill development. How can I assist you in achieving your career goals?`;
    
    return response;
  }

  async analyzeDocument(content: string, fileName: string): Promise<string> {
    // Simple document analysis - can be enhanced with AI
    const wordCount = content.split(' ').length;
    const hasResume = fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv');
    const hasCover = fileName.toLowerCase().includes('cover');
    
    if (hasResume) {
      return `I've analyzed your resume "${fileName}" (${wordCount} words). Based on the content, here are some observations and suggestions for improvement:\n\n• Consider highlighting quantifiable achievements\n• Ensure your skills section matches your target role\n• Review formatting for readability\n• Add relevant keywords for your industry\n\nWould you like specific feedback on any section?`;
    }
    
    if (hasCover) {
      return `I've reviewed your cover letter "${fileName}" (${wordCount} words). Here are some suggestions:\n\n• Customize it for each specific role\n• Show enthusiasm for the company\n• Connect your experience to their needs\n• Include a strong closing call-to-action\n\nWould you like help tailoring this for a specific position?`;
    }
    
    return `I've analyzed your document "${fileName}" (${wordCount} words). This appears to be a career-related document. I can provide feedback on content structure, clarity, and professional presentation. What specific aspect would you like me to focus on?`;
  }

  async generateCareerRoadmap(preferences: any): Promise<any> {
    // Enhanced career roadmap generation
    const timeline = preferences.timeline || '2-3 years';
    const field = preferences.field || 'technology';
    const experience = preferences.experience || 'entry-level';
    
    return {
      title: `Your Personalized ${field.charAt(0).toUpperCase() + field.slice(1)} Career Roadmap`,
      timeline,
      currentLevel: experience,
      targetRole: preferences.targetRole || 'Senior Professional',
      phases: [
        {
          phase: 'Foundation Building',
          duration: '0-6 months',
          focus: 'Essential Skills & Knowledge',
          tasks: [
            'Complete relevant online courses or certifications',
            'Build a professional portfolio/GitHub profile',
            'Network with professionals in your field',
            'Optimize LinkedIn profile and resume'
          ],
          skills: ['Technical fundamentals', 'Communication', 'Problem-solving'],
          milestones: ['Complete 2-3 key certifications', 'Build 3-5 portfolio projects']
        },
        {
          phase: 'Skill Development',
          duration: '6-18 months',
          focus: 'Practical Experience & Specialization',
          tasks: [
            'Gain hands-on experience through projects/internships',
            'Choose a specialization area',
            'Contribute to open-source projects',
            'Attend industry events and conferences'
          ],
          skills: ['Advanced technical skills', 'Project management', 'Leadership'],
          milestones: ['Land first relevant position', 'Complete major project']
        },
        {
          phase: 'Professional Growth',
          duration: '18+ months',
          focus: 'Leadership & Expertise',
          tasks: [
            'Take on leadership responsibilities',
            'Mentor junior colleagues',
            'Develop strategic thinking skills',
            'Build industry reputation'
          ],
          skills: ['Team leadership', 'Strategic planning', 'Industry expertise'],
          milestones: ['Promotion to senior role', 'Industry recognition']
        }
      ],
      recommendations: [
        'Focus on continuous learning and skill development',
        'Build a strong professional network in your field',
        'Seek mentorship from experienced professionals',
        'Document your achievements and learnings',
        'Stay updated with industry trends and technologies'
      ],
      resources: [
        'Online learning platforms (Coursera, Udemy, LinkedIn Learning)',
        'Professional associations and communities',
        'Industry publications and blogs',
        'Networking events and conferences',
        'Career coaching and mentorship programs'
      ]
    };
  }
}