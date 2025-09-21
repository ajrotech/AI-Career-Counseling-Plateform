import { useState, useEffect, useCallback, useRef } from 'react';
import chatAPI, { ChatMessage, ChatSession, ChatRequest } from '../services/chat';

interface UseChatOptions {
  sessionId?: string;
  enableHistory?: boolean;
  autoSave?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, context?: any) => Promise<void>;
  createNewSession: (title?: string) => Promise<ChatSession>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearHistory: () => void;
  retryLastMessage: () => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const { sessionId: initialSessionId, enableHistory = true, autoSave = true } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastUserMessageRef = useRef<string>('');
  const lastContextRef = useRef<any>(null);

  // Load initial chat history and sessions
  useEffect(() => {
    if (enableHistory) {
      loadChatHistory();
      loadChatSessions();
    }
  }, [enableHistory]);

  // Load specific session if provided
  useEffect(() => {
    if (initialSessionId) {
      switchSession(initialSessionId);
    }
  }, [initialSessionId]);

  const loadChatHistory = useCallback(() => {
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  const loadChatSessions = useCallback(async () => {
    try {
      const userSessions = await chatAPI.getChatSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  }, []);

  const saveToLocalStorage = useCallback((messagesToSave: ChatMessage[]) => {
    if (autoSave) {
      try {
        localStorage.setItem('chat_messages', JSON.stringify(messagesToSave));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [autoSave]);

  const sendMessage = useCallback(async (content: string, context?: any) => {
    console.log('🚀 [USE CHAT HOOK] sendMessage called');
    console.log('📝 [USE CHAT HOOK] Content:', content);
    console.log('📋 [USE CHAT HOOK] Context:', context);
    console.log('⏳ [USE CHAT HOOK] Is loading:', isLoading);
    console.log('🏠 [USE CHAT HOOK] Current session:', currentSession);
    
    if (!content.trim() || isLoading) {
      console.log('⚠️ [USE CHAT HOOK] Message not sent - empty content or loading');
      return;
    }

    setIsLoading(true);
    setError(null);
    lastUserMessageRef.current = content;
    lastContextRef.current = context;

    console.log('👤 [USE CHAT HOOK] Creating user message...');
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    console.log('📨 [USE CHAT HOOK] User message:', userMessage);

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveToLocalStorage(updatedMessages);
    console.log('💾 [USE CHAT HOOK] User message saved to state and localStorage');

    try {
      const request: ChatRequest = {
        message: content,
        sessionId: currentSession?.id,
        context: {
          ...context,
          currentPage: window.location.pathname
        }
      };
      console.log('📡 [USE CHAT HOOK] API request:', request);
      console.log('🌐 [USE CHAT HOOK] Making API call to chatAPI.sendMessage...');

      const response = await chatAPI.sendMessage(request);
      console.log('✅ [USE CHAT HOOK] API response received:', response);
      
      const aiMessage: ChatMessage = {
        id: response.id,
        type: 'ai',
        content: response.content,
        timestamp: new Date(response.createdAt)
      };
      console.log('🤖 [USE CHAT HOOK] AI message:', aiMessage);

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveToLocalStorage(finalMessages);
      console.log('💾 [USE CHAT HOOK] AI message saved to state and localStorage');

      // Update session if response includes sessionId and we don't have a current session
      if (response.sessionId && !currentSession) {
        console.log('🔄 [USE CHAT HOOK] Updating session with ID:', response.sessionId);
        const session = await chatAPI.getChatSession(response.sessionId);
        if (session) {
          setCurrentSession(session);
          console.log('✅ [USE CHAT HOOK] Session updated:', session);
          await loadChatSessions(); // Refresh sessions list
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your message. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      
      const errorMessages = [...updatedMessages, errorMessage];
      setMessages(errorMessages);
      saveToLocalStorage(errorMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSession, isLoading, saveToLocalStorage, loadChatSessions]);

  const createNewSession = useCallback(async (title?: string): Promise<ChatSession> => {
    try {
      setIsLoading(true);
      const newSession = await chatAPI.createChatSession(title);
      setCurrentSession(newSession);
      setSessions(prev => [newSession, ...prev]);
      
      // Clear current messages for new session
      setMessages([]);
      saveToLocalStorage([]);
      
      return newSession;
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Failed to create new chat session');
      throw error; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [saveToLocalStorage]);

  const switchSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const session = await chatAPI.getChatSession(sessionId);
      if (session) {
        setCurrentSession(session);
        setMessages(session.messages || []);
        saveToLocalStorage(session.messages || []);
      }
    } catch (error) {
      console.error('Error switching session:', error);
      setError('Failed to load chat session');
    } finally {
      setIsLoading(false);
    }
  }, [saveToLocalStorage]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await chatAPI.deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleting current session, clear it
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        saveToLocalStorage([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete chat session');
    }
  }, [currentSession, saveToLocalStorage]);

  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      const updatedSession = await chatAPI.updateChatSession(sessionId, { title });
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }
    } catch (error) {
      console.error('Error updating session title:', error);
      setError('Failed to update session title');
    }
  }, [currentSession]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    saveToLocalStorage([]);
    setError(null);
  }, [saveToLocalStorage]);

  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current, lastContextRef.current);
    }
  }, [sendMessage]);

  return {
    messages,
    sessions,
    currentSession,
    isLoading,
    error,
    sendMessage,
    createNewSession,
    switchSession,
    deleteSession,
    clearHistory,
    retryLastMessage,
    updateSessionTitle
  };
};