import apiService from './api';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    context?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    userProfile?: any;
    assessmentResults?: any;
    currentPage?: string;
  };
}

export interface ChatResponse {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  sessionId: string;
  createdAt: string;
  suggestions?: string[];
}

class ChatAPIService {
  private baseUrl = '/chat';

  /**
   * Send a message to the AI chat service
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    console.log('🚀 [CHAT API SERVICE] sendMessage called');
    console.log('📡 [CHAT API SERVICE] Request URL:', `${this.baseUrl}/message`);
    console.log('📝 [CHAT API SERVICE] Request data:', JSON.stringify(request, null, 2));
    
    try {
      console.log('🌐 [CHAT API SERVICE] Making POST request to backend...');
      const response = await apiService.post<ChatResponse>(`${this.baseUrl}/message`, request);
      console.log('📡 [CHAT API SERVICE] Raw response from apiService:', response);
      
      if (response.success && response.data) {
        console.log('✅ [CHAT API SERVICE] Successful response:', response.data);
        return response.data;
      }
      console.log('❌ [CHAT API SERVICE] Response not successful:', response);
      throw new Error(response.message || 'Failed to send message');
    } catch (error) {
      console.error('❌ [CHAT API SERVICE] Error occurred:', error);
      console.error('❌ [CHAT API SERVICE] Error stack:', error.stack);
      throw new Error('Failed to send message to AI chat service');
    }
  }

  /**
   * Get chat sessions for the current user
   */
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await apiService.get<ChatSession[]>(`${this.baseUrl}/sessions`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
  }

  /**
   * Get a specific chat session
   */
  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      console.log('🚀 [CHAT API SERVICE] getChatSession called for sessionId:', sessionId);
      
      // First get the session details
      const sessionResponse = await apiService.get<ChatSession>(`${this.baseUrl}/sessions/${sessionId}`);
      console.log('📡 [CHAT API SERVICE] Session response:', sessionResponse);
      
      if (!sessionResponse.success || !sessionResponse.data) {
        console.log('❌ [CHAT API SERVICE] Failed to get session');
        return null;
      }

      // Then get the session messages
      console.log('📨 [CHAT API SERVICE] Fetching session messages...');
      const messagesResponse = await apiService.get<ChatResponse[]>(`${this.baseUrl}/sessions/${sessionId}/messages`);
      console.log('📨 [CHAT API SERVICE] Messages response:', messagesResponse);
      
      const session = sessionResponse.data;
      
      // Convert backend messages to frontend format
      if (messagesResponse.success && messagesResponse.data) {
        session.messages = messagesResponse.data.map(msg => ({
          id: msg.id,
          type: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          timestamp: new Date(msg.createdAt)
        }));
        console.log('✅ [CHAT API SERVICE] Converted messages:', session.messages);
      } else {
        console.log('⚠️ [CHAT API SERVICE] No messages found for session');
        session.messages = [];
      }
      
      console.log('✅ [CHAT API SERVICE] Returning session with messages:', session);
      return session;
    } catch (error) {
      console.error('❌ [CHAT API SERVICE] Error fetching chat session:', error);
      return null;
    }
  }

  /**
   * Get messages for a specific chat session
   */
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      console.log('🚀 [CHAT API SERVICE] getSessionMessages called for sessionId:', sessionId);
      
      const response = await apiService.get<ChatResponse[]>(`${this.baseUrl}/sessions/${sessionId}/messages`);
      console.log('📨 [CHAT API SERVICE] Messages response:', response);
      
      if (response.success && response.data) {
        const messages = response.data.map(msg => ({
          id: msg.id,
          type: msg.role === 'user' ? 'user' : 'ai' as 'user' | 'ai',
          content: msg.content,
          timestamp: new Date(msg.createdAt)
        }));
        console.log('✅ [CHAT API SERVICE] Converted messages:', messages);
        return messages;
      }
      
      console.log('⚠️ [CHAT API SERVICE] No messages found');
      return [];
    } catch (error) {
      console.error('❌ [CHAT API SERVICE] Error fetching session messages:', error);
      return [];
    }
  }

  /**
   * Create a new chat session
   */
  async createChatSession(title?: string): Promise<ChatSession> {
    try {
      const response = await apiService.post<ChatSession>(`${this.baseUrl}/sessions`, {
        title: title || 'New Chat Session'
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create session');
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Delete a chat session
   */
  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/sessions/${sessionId}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw new Error('Failed to delete chat session');
    }
  }

  /**
   * Update chat session title
   */
  async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    try {
      const response = await apiService.patch<ChatSession>(`${this.baseUrl}/sessions/${sessionId}`, updates);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update session');
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw new Error('Failed to update chat session');
    }
  }

  /**
   * Get suggested prompts based on user context
   */
  async getSuggestedPrompts(context?: any): Promise<string[]> {
    try {
      const response = await apiService.post<{ suggestions: string[] }>(`${this.baseUrl}/suggestions`, {
        context
      });
      if (response.success && response.data) {
        return response.data.suggestions;
      }
      return [
        'Help me plan my career path',
        'What skills should I develop?',
        'How can I improve my resume?',
        'Prepare me for interviews'
      ];
    } catch (error) {
      console.error('Error fetching suggested prompts:', error);
      return [
        'Help me plan my career path',
        'What skills should I develop?',
        'How can I improve my resume?',
        'Prepare me for interviews'
      ];
    }
  }

  /**
   * Analyze uploaded documents (resume, cover letter, etc.)
   */
  async analyzeDocument(file: File, type: 'resume' | 'cover-letter' | 'job-description'): Promise<{
    analysis: string;
    suggestions: string[];
    score?: number;
  }> {
    try {
      // For now, create a mock response until backend supports file upload
      return {
        analysis: `Mock analysis of ${type}: This ${type} shows good structure and content. Consider improving the following areas for better impact.`,
        suggestions: [
          'Add more quantifiable achievements',
          'Use stronger action verbs',
          'Tailor content to specific roles',
          'Improve formatting and layout'
        ],
        score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document');
    }
  }

  /**
   * Get career roadmap suggestions
   */
  async getCareerRoadmap(targetRole: string, currentSkills: string[]): Promise<{
    roadmap: {
      phase: string;
      duration: string;
      skills: string[];
      resources: string[];
    }[];
    timeline: string;
  }> {
    try {
      // Mock response until backend implementation
      return {
        roadmap: [
          {
            phase: 'Foundation Building',
            duration: '3-6 months',
            skills: ['Basic programming', 'Problem solving', 'Version control'],
            resources: ['Online courses', 'Practice projects', 'Coding bootcamps']
          },
          {
            phase: 'Skill Enhancement',
            duration: '6-12 months',
            skills: ['Advanced frameworks', 'System design', 'Testing'],
            resources: ['Advanced courses', 'Open source contributions', 'Mentorship']
          },
          {
            phase: 'Professional Development',
            duration: '12+ months',
            skills: ['Leadership', 'Architecture', 'Team collaboration'],
            resources: ['Industry certifications', 'Conference speaking', 'Team projects']
          }
        ],
        timeline: '18-24 months to reach ' + targetRole + ' level'
      };
    } catch (error) {
      console.error('Error getting career roadmap:', error);
      throw new Error('Failed to generate career roadmap');
    }
  }
}

const chatAPI = new ChatAPIService();
export default chatAPI;