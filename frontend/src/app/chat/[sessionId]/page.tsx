'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, Bot, User, Lightbulb, Briefcase, GraduationCap, Upload, Download, Settings, History, Plus, Trash2, Edit3, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../../../hooks/useChat';
import { useUserContext } from '../../../hooks/useUserContext';
import chatAPI from '../../../services/chat';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

export default function ChatSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const {
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
  } = useChat({ enableHistory: true, autoSave: true, sessionId });

  const {
    userContext,
    isLoading: isContextLoading,
    generateContextPrompt
  } = useUserContext();

  const [inputMessage, setInputMessage] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'career-advice',
      label: 'Career Advice',
      icon: <Briefcase className="w-4 h-4" />,
      prompt: 'I need personalized career advice based on my profile and assessment results'
    },
    {
      id: 'skill-development',
      label: 'Skill Development',
      icon: <GraduationCap className="w-4 h-4" />,
      prompt: 'What skills should I develop to advance in my career?'
    },
    {
      id: 'job-search',
      label: 'Job Search Tips',
      icon: <Lightbulb className="w-4 h-4" />,
      prompt: 'Give me personalized job search and interview strategies'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load session from URL parameter
  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      console.log('🔗 [CHAT SESSION] Loading session from URL:', sessionId);
      switchSession(sessionId);
    }
  }, [sessionId, switchSession]);

  // Update document title with current session ID
  useEffect(() => {
    if (currentSession) {
      const sessionIdShort = currentSession.id.substring(0, 8);
      document.title = `Chat Session: ${sessionIdShort} - ${currentSession.title || 'Career Counseling'}`;
      console.log('📝 [CHAT SESSION] Updated tab title with session:', sessionIdShort);
    } else {
      document.title = 'Career Counseling Chat';
      console.log('📝 [CHAT SESSION] Updated tab title to default (no session)');
    }

    return () => {
      document.title = 'Career Counseling Platform';
    };
  }, [currentSession]);

  // Update URL when session changes
  useEffect(() => {
    if (currentSession && currentSession.id !== sessionId) {
      console.log('🔄 [CHAT SESSION] Updating URL with new session:', currentSession.id);
      router.replace(`/chat/${currentSession.id}`);
    }
  }, [currentSession, sessionId, router]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    console.log('🚀 [CHAT SESSION] handleSendMessage called');
    console.log('📝 [CHAT SESSION] Message content:', messageContent);
    console.log('⏳ [CHAT SESSION] Is loading:', isLoading);
    
    if (!messageContent || isLoading) {
      console.log('⚠️ [CHAT SESSION] Message not sent - empty content or loading');
      return;
    }

    // Include user context as metadata, not in the message content
    console.log('🔄 [CHAT SESSION] Preparing context as metadata...');
    const contextPrompt = generateContextPrompt();
    console.log('📋 [CHAT SESSION] Context prompt:', contextPrompt);

    console.log('👤 [CHAT SESSION] User context:', {
      profile: userContext.profile,
      assessmentResults: userContext.assessmentResults,
      preferences: userContext.preferences
    });

    try {
      console.log('🔄 [CHAT SESSION] Sending message to API...');
      await sendMessage(messageContent, {
        userProfile: userContext.profile,
        assessmentResults: userContext.assessmentResults,
        preferences: userContext.preferences,
        contextPrompt: contextPrompt,
        currentPage: window.location.pathname
      });
      console.log('✅ [CHAT SESSION] Message sent successfully');
    } catch (error) {
      console.error('❌ [CHAT SESSION] Error sending message:', error);
    }
    
    setInputMessage('');
    console.log('🧹 [CHAT SESSION] Input message cleared');
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    try {
      const analysis = await chatAPI.analyzeDocument(file, 'resume');
      let analysisMessage = `I've analyzed your ${file.name}. Here's my assessment:\n\n${analysis.analysis}\n\nSuggestions for improvement:\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}`;
      
      if (analysis.score) {
        analysisMessage += `\n\nOverall Score: ${analysis.score}/100`;
      }
      
      await sendMessage(analysisMessage);
    } catch (error) {
      console.error('Error analyzing file:', error);
    }
  };

  const handleNewSession = async () => {
    await createNewSession();
    setShowSessions(false);
    // The useEffect will automatically update the URL when currentSession changes
  };

  const handleSwitchSession = async (newSessionId: string) => {
    console.log('🔄 [CHAT SESSION] Switching to session:', newSessionId);
    router.push(`/chat/${newSessionId}`);
    setShowSessions(false);
  };

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteSession(sessionIdToDelete);
      
      // If we deleted the current session, redirect to main chat
      if (sessionIdToDelete === sessionId) {
        router.push('/chat');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Sessions */}
      {showSessions && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <button
                onClick={handleNewSession}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                  currentSession?.id === session.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
                onClick={() => handleSwitchSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {session.id.substring(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <p className="text-gray-500 text-center py-8">No chat history yet</p>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">AI Career Counselor</h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {userContext.profile ? `Hi ${userContext.profile.name}!` : 'Get personalized career guidance'}
                    </p>
                    {currentSession && (
                      <>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-400">Session:</span>
                          <code 
                            className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono cursor-help"
                            title={`Full Session ID: ${currentSession.id}`}
                          >
                            {currentSession.id.substring(0, 8)}...
                          </code>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSessions(!showSessions)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Chat History"
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Advanced Features"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Features Panel */}
        {showAdvanced && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Advanced Features</h3>
                  <p className="text-xs text-blue-700">Upload documents for analysis or generate career roadmaps</p>
                </div>
                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Upload Resume
                  </button>
                  <button
                    onClick={() => handleSendMessage('Generate a personalized career roadmap for me')}
                    className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                  >
                    Career Roadmap
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to your AI Career Counselor!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {userContext.profile 
                      ? `Hi ${userContext.profile.name}! I'm here to provide personalized career guidance based on your profile and assessment results.`
                      : "I'm here to help you with career guidance, job search strategies, and professional development."
                    }
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      {message.type === 'ai' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-sm max-w-none"
                          components={{
                            h1: ({...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                            h2: ({...props}) => <h2 className="text-base font-semibold mb-2" {...props} />,
                            h3: ({...props}) => <h3 className="text-sm font-medium mb-1" {...props} />,
                            p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                            ol: ({...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                            li: ({...props}) => <li className="text-sm" {...props} />,
                            strong: ({...props}) => <strong className="font-semibold" {...props} />,
                            em: ({...props}) => <em className="italic" {...props} />,
                            code: ({...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                            pre: ({...props}) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto mb-2" {...props} />,
                            blockquote: ({...props}) => <blockquote className="border-l-4 border-gray-300 pl-3 italic mb-2" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                      <div className={`text-xs mt-2 flex items-center justify-between ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.type === 'ai' && error && (
                          <button
                            onClick={retryLastMessage}
                            className="text-xs underline hover:no-underline"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 0 && !isLoading && (
              <div className="px-4 py-4 border-t border-gray-200 bg-white">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-4 bg-white border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={userContext.profile ? "Ask me anything about your career..." : "Tell me about your career goals..."}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
              
              {uploadedFile && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700">📎 {uploadedFile.name}</span>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}