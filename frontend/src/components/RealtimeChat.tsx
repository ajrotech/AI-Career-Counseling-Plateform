'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
}

interface RealtimeChatProps {
  sessionId?: string;
}

export default function RealtimeChat({ sessionId }: RealtimeChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { trackEvent, trackButtonClick } = useAnalytics();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      
      // Track WebSocket connection
      trackEvent({
        eventType: 'chat_message',
        eventCategory: 'chat',
        eventAction: 'websocket_connected',
        properties: { sessionId },
      });
      
      // Join session if provided
      if (sessionId) {
        newSocket.emit('joinSession', { sessionId });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('messageReceived', (data: {
      id: string;
      content: string;
      userId: string;
      timestamp: string;
    }) => {
      setMessages(prev => [...prev, {
        id: data.id,
        content: data.content,
        isUser: false,
        timestamp: new Date(data.timestamp),
      }]);
    });

    newSocket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !socket || !isConnected) return;

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    // Track chat message
    trackEvent({
      eventType: 'chat_message',
      eventCategory: 'chat',
      eventAction: 'message_sent',
      eventLabel: 'user_message',
      eventValue: inputMessage.length,
      properties: { 
        messageLength: inputMessage.length,
        sessionId,
        messageType: 'user'
      },
    });

    // Add user message to local state
    setMessages(prev => [...prev, userMessage]);

    // Send message via WebSocket
    socket.emit('sendMessage', {
      message: inputMessage,
      sessionId,
    });

    setInputMessage('');
    stopTyping();
  };

  const handleTyping = (value: string) => {
    setInputMessage(value);
    
    if (!socket || !isConnected) return;

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { isTyping: true });
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
      socket.emit('typing', { isTyping: false });
    }
  };

  const stopTyping = () => {
    if (socket && isConnected && isTyping) {
      setIsTyping(false);
      socket.emit('typing', { isTyping: false });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-96 border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-semibold">AI Career Counselor</h3>
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <span className="text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>👋 Welcome! I'm your AI career counselor.</p>
            <p className="text-sm mt-2">Ask me anything about your career path!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicators */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center space-x-1">
                <span className="text-sm">AI is typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={stopTyping}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            disabled={!isConnected}
          />
          <button
            onClick={() => {
              trackButtonClick('send_message', 'chat_interface');
              sendMessage();
            }}
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        {!isConnected && (
          <p className="text-red-500 text-sm mt-1">
            Connection lost. Please refresh the page.
          </p>
        )}
      </div>
    </div>
  );
}