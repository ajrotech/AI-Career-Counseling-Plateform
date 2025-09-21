import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../../entities/chat-session.entity';
import { ChatMessage, MessageRole } from '../../entities/chat-message.entity';
import { User } from '../../entities/user.entity';
import { SendMessageDto, CreateSessionDto, ChatMessageResponse, ChatSessionResponse, ChatContext } from './dto/chat.dto';
import { CareerRoadmapPreferencesDto } from './dto/career-roadmap.dto';
import { AIService, AIMessage } from './ai.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private aiService: AIService,
  ) {}

  async createSession(userId: string, createSessionDto: CreateSessionDto): Promise<ChatSessionResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const session = this.chatSessionRepository.create({
      title: createSessionDto.title || 'New Chat',
      context: createSessionDto.context,
      userId,
      user,
    });

    const savedSession = await this.chatSessionRepository.save(session);
    
    return {
      id: savedSession.id,
      title: savedSession.title,
      context: savedSession.context,
      isActive: savedSession.isActive,
      createdAt: savedSession.createdAt,
      updatedAt: savedSession.updatedAt,
    };
  }

  async getUserSessions(userId: string): Promise<ChatSessionResponse[]> {
    const sessions = await this.chatSessionRepository.find({
      where: { userId, isActive: true },
      order: { updatedAt: 'DESC' },
      relations: ['messages'],
    });

    return sessions.map(session => ({
      id: session.id,
      title: session.title,
      context: session.context,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages?.length || 0,
      lastMessage: session.messages && session.messages.length > 0 
        ? {
            id: session.messages[session.messages.length - 1].id,
            content: session.messages[session.messages.length - 1].content,
            role: session.messages[session.messages.length - 1].role as 'user' | 'assistant' | 'system',
            sessionId: session.messages[session.messages.length - 1].sessionId,
            createdAt: session.messages[session.messages.length - 1].createdAt,
          }
        : undefined,
    }));
  }

  async getSession(sessionId: string, userId: string): Promise<ChatSessionResponse | null> {
    console.log('🚀 [CHAT SERVICE] getSession called');
    console.log('🔑 [CHAT SERVICE] sessionId:', sessionId);
    console.log('🔑 [CHAT SERVICE] userId:', userId);
    
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId, isActive: true },
      relations: ['messages'],
    });

    if (!session) {
      console.log('❌ [CHAT SERVICE] Session not found');
      return null;
    }

    console.log('✅ [CHAT SERVICE] Session found:', session.title);
    
    return {
      id: session.id,
      title: session.title,
      context: session.context,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages?.length || 0,
      lastMessage: session.messages && session.messages.length > 0 
        ? {
            id: session.messages[session.messages.length - 1].id,
            content: session.messages[session.messages.length - 1].content,
            role: session.messages[session.messages.length - 1].role as 'user' | 'assistant' | 'system',
            sessionId: session.messages[session.messages.length - 1].sessionId,
            createdAt: session.messages[session.messages.length - 1].createdAt,
          }
        : undefined,
    };
  }

  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessageResponse[]> {
    const messages = await this.chatMessageRepository.find({
      where: { sessionId, userId },
      order: { createdAt: 'ASC' },
    });

    return messages.map(message => ({
      id: message.id,
      content: message.content,
      role: message.role as 'user' | 'assistant' | 'system',
      sessionId: message.sessionId,
      createdAt: message.createdAt,
    }));
  }

  async sendMessage(userId: string, sendMessageDto: SendMessageDto): Promise<ChatMessageResponse> {
    console.log('🚀 [CHAT SERVICE] sendMessage called');
    console.log('🔑 [CHAT SERVICE] userId:', userId);
    console.log('📝 [CHAT SERVICE] sendMessageDto:', JSON.stringify(sendMessageDto, null, 2));
    
    let sessionId = sendMessageDto.sessionId;

    // Create new session if none provided or validate existing session
    if (!sessionId) {
      console.log('📝 [CHAT SERVICE] No sessionId provided, creating new session');
      const newSession = await this.createSession(userId, { title: 'New Chat' });
      sessionId = newSession.id;
      console.log('✅ [CHAT SERVICE] Created new session:', sessionId);
    } else {
      console.log('🔗 [CHAT SERVICE] Checking existing session:', sessionId);
      
      // Check if the session exists
      const existingSession = await this.chatSessionRepository.findOne({
        where: { id: sessionId, userId, isActive: true }
      });
      
      if (!existingSession) {
        console.log('❌ [CHAT SERVICE] Session not found, creating new session');
        const newSession = await this.createSession(userId, { title: 'New Chat' });
        sessionId = newSession.id;
        console.log('✅ [CHAT SERVICE] Created new session:', sessionId);
      } else {
        console.log('✅ [CHAT SERVICE] Using existing valid session:', sessionId);
      }
    }

    // Save user message
    console.log('💾 [CHAT SERVICE] Saving user message...');
    const userMessage = this.chatMessageRepository.create({
      role: MessageRole.USER,
      content: sendMessageDto.message,
      sessionId,
      userId,
      metadata: JSON.stringify({ context: sendMessageDto.context }),
    });

    const savedUserMessage = await this.chatMessageRepository.save(userMessage);
    console.log('✅ [CHAT SERVICE] User message saved with ID:', savedUserMessage.id);

    // Generate AI response using AI service
    console.log('🤖 [CHAT SERVICE] Generating AI response...');
    const aiResponse = await this.generateAIResponse(sendMessageDto.message, sendMessageDto.context, sessionId);
    console.log('🤖 [CHAT SERVICE] AI response generated:', aiResponse.substring(0, 100) + '...');

    // Save AI response
    console.log('💾 [CHAT SERVICE] Saving AI response...');
    const assistantMessage = this.chatMessageRepository.create({
      role: MessageRole.ASSISTANT,
      content: aiResponse,
      sessionId,
      userId,
      metadata: JSON.stringify({ generatedAt: new Date() }),
    });

    const savedAssistantMessage = await this.chatMessageRepository.save(assistantMessage);
    console.log('✅ [CHAT SERVICE] AI message saved with ID:', savedAssistantMessage.id);

    // Update session timestamp
    await this.chatSessionRepository.update(sessionId, { updatedAt: new Date() });
    console.log('🔄 [CHAT SERVICE] Session timestamp updated');

    const response = {
      id: savedAssistantMessage.id,
      content: savedAssistantMessage.content,
      role: savedAssistantMessage.role as 'user' | 'assistant' | 'system',
      sessionId: savedAssistantMessage.sessionId,
      createdAt: savedAssistantMessage.createdAt,
    };
    
    console.log('📤 [CHAT SERVICE] Returning response:', JSON.stringify(response, null, 2));
    return response;
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Soft delete by marking as inactive
    await this.chatSessionRepository.update(sessionId, { isActive: false });
  }

  private async generateAIResponse(message: string, context?: ChatContext, sessionId?: string): Promise<string> {
    console.log('🤖 [CHAT SERVICE] generateAIResponse called');
    console.log('📝 [CHAT SERVICE] Original message:', message);
    console.log('📋 [CHAT SERVICE] Context:', context);
    
    try {
      // Get conversation history for context
      const conversationHistory: AIMessage[] = [];
      
      if (sessionId) {
        const recentMessages = await this.chatMessageRepository.find({
          where: { sessionId },
          order: { createdAt: 'DESC' },
          take: 10, // Last 10 messages for context
        });
        
        // Convert to AI message format (reverse to get chronological order)
        recentMessages.reverse().forEach(msg => {
          conversationHistory.push({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          });
        });
      }
      
      // Create enhanced message with context if available
      let enhancedMessage = message;
      if (context?.contextPrompt) {
        enhancedMessage = `${context.contextPrompt}\n\nUser Question: ${message}`;
        console.log('📧 [CHAT SERVICE] Enhanced message with context:', enhancedMessage);
      }
      
      // Add current message
      conversationHistory.push({
        role: 'user',
        content: enhancedMessage,
      });
      
      console.log('💬 [CHAT SERVICE] Conversation history:', conversationHistory);
      
      // Use AI service to generate response with session context - try DeepSeek first, then GPT-OSS
      const response = await this.aiService.generateResponse(conversationHistory, context, sessionId, 'auto');
      console.log('🤖 [CHAT SERVICE] AI response generated');
      return response;
    } catch (error) {
      console.error('❌ [CHAT SERVICE] Error generating AI response:', error);
      return this.generateFallbackResponse(message, context);
    }
  }

  private generateFallbackResponse(message: string, context?: ChatContext): string {
    // Fallback response logic (original mock implementation)
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      return `Based on your career interests, I'd recommend exploring roles that align with your skills and passions. What specific field are you most interested in? I can help you create a personalized career roadmap.`;
    }
    
    if (lowerMessage.includes('assessment') || lowerMessage.includes('test')) {
      return `I can help you understand your assessment results and how they relate to potential career paths. Would you like me to analyze your previous assessments or suggest new ones that might be helpful?`;
    }
    
    if (lowerMessage.includes('mentor') || lowerMessage.includes('guidance')) {
      return `Finding the right mentor can be crucial for your career development. Based on your profile, I can recommend mentors who specialize in your areas of interest. What specific expertise are you looking for in a mentor?`;
    }
    
    // Generic response with context awareness
    let response = `I understand you're asking about "${message}". `;
    
    if (context?.userProfile) {
      response += `Based on your profile, `;
    }
    
    response += `I'm here to help you with career guidance, assessment insights, and connecting you with the right resources. How can I assist you further?`;
    
    return response;
  }

  async analyzeDocument(userId: string, fileContent: string, fileName: string): Promise<string> {
    return await this.aiService.analyzeDocument(fileContent, fileName);
  }

  async generateCareerRoadmap(userId: string, preferences: CareerRoadmapPreferencesDto): Promise<any> {
    return await this.aiService.generateCareerRoadmap(preferences);
  }
}