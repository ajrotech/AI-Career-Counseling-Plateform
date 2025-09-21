'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '../../hooks/useChat';

export default function ChatPage() {
  const router = useRouter();
  const { createNewSession, sessions, isLoading } = useChat({ enableHistory: true });

  useEffect(() => {
    const initializeChat = async () => {
      // Check if there are existing sessions
      if (sessions.length > 0 && !isLoading) {
        // Redirect to the most recent session
        const mostRecentSession = sessions[0];
        console.log('🔄 [CHAT] Redirecting to most recent session:', mostRecentSession.id);
        router.replace(`/chat/${mostRecentSession.id}`);
      } else if (!isLoading) {
        // Create a new session and redirect to it
        console.log('🆕 [CHAT] Creating new session...');
        try {
          const newSession = await createNewSession();
          if (newSession) {
            console.log('✅ [CHAT] New session created, redirecting:', newSession.id);
            router.replace(`/chat/${newSession.id}`);
          }
        } catch (error) {
          console.error('❌ [CHAT] Error creating new session:', error);
          // Fallback: redirect to a 'new' session page
          router.replace('/chat/new');
        }
      }
    };

    initializeChat();
  }, [sessions, isLoading, createNewSession, router]);

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Chat...</h2>
        <p className="text-gray-500">Setting up your conversation</p>
      </div>
    </div>
  );
}