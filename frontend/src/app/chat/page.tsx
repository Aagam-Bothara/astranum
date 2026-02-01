'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  nickname?: string;
  relationship: string;
  is_primary: boolean;
  avatar_color?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    dataPointsUsed?: string[];
    validationPassed?: boolean;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface UsageStatus {
  tier: 'free' | 'starter' | 'pro';
  dailyRemaining: number;
  monthlyRemaining: number;
  lifetimeRemaining?: number;
  canAsk: boolean;
  limitMessage?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, hasProfile, user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [usage, setUsage] = useState<UsageStatus>({
    tier: 'free',
    dailyRemaining: 0,
    monthlyRemaining: 0,
    lifetimeRemaining: 2,
    canAsk: true,
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [responseStyle, setResponseStyle] = useState<'supportive' | 'balanced' | 'direct'>('balanced');
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('hinglish');
  const [savingSettings, setSavingSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Get current session's messages
  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Helper to get user-specific storage key
  const getStorageKey = (base: string, uid: string | null) => {
    return uid ? `${base}_${uid}` : base;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate title from first message
  const generateTitle = (message: string) => {
    const maxLength = 30;
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Create a new chat session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  // Delete a chat session
  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = chatSessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        createNewSession();
      }
    }
  };

  // Redirect based on auth state
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!hasProfile) {
      router.replace('/onboard');
      return;
    }
  }, [authLoading, isAuthenticated, hasProfile, router]);

  // Load user data and sessions on mount
  useEffect(() => {
    if (authLoading || !isAuthenticated || !hasProfile) return;
    if (initialized) return;

    const initializeChat = async () => {
      try {
        const profileResponse = await api.getProfile();
        const userData = profileResponse.data as any;
        const currentUserId = userData?.user_id || userData?.id;

        if (currentUserId) {
          setUserId(currentUserId);

          const lastUserId = localStorage.getItem('astravaani_last_user');
          if (lastUserId && lastUserId !== currentUserId) {
            localStorage.removeItem(getStorageKey('astravaani_sessions', lastUserId));
          }

          localStorage.setItem('astravaani_last_user', currentUserId);

          // Load saved sessions
          const storageKey = getStorageKey('astravaani_sessions', currentUserId);
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              const sessions = parsed.map((s: any) => ({
                ...s,
                createdAt: new Date(s.createdAt),
                updatedAt: new Date(s.updatedAt),
                messages: s.messages.map((m: any) => ({
                  ...m,
                  timestamp: new Date(m.timestamp),
                })),
              }));
              setChatSessions(sessions);
              if (sessions.length > 0) {
                setCurrentSessionId(sessions[0].id);
              }
            } catch {
              // Ignore parse errors
            }
          }

          // Migrate old single-session messages if exists
          const oldMessagesKey = getStorageKey('astravaani_messages', currentUserId);
          const oldMessages = localStorage.getItem(oldMessagesKey);
          if (oldMessages && !saved) {
            try {
              const parsed = JSON.parse(oldMessages);
              if (parsed.length > 0) {
                const migratedSession: ChatSession = {
                  id: Date.now().toString(),
                  title: generateTitle(parsed[0].content),
                  messages: parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp),
                  })),
                  createdAt: new Date(parsed[0].timestamp),
                  updatedAt: new Date(parsed[parsed.length - 1].timestamp),
                };
                setChatSessions([migratedSession]);
                setCurrentSessionId(migratedSession.id);
                localStorage.removeItem(oldMessagesKey);
              }
            } catch {
              // Ignore
            }
          }
        }

        setInitialized(true);
      } catch (error: any) {
        // Error fetching profile - this shouldn't happen if auth is valid
        console.error('Error initializing chat:', error);
      }

      // Fetch usage
      try {
        const response = await api.checkUsage();
        const data = response.data as any;
        if (data) {
          const tier = (data.usage?.tier || 'free').toLowerCase();
          setUsage({
            tier: tier as 'free' | 'starter' | 'pro',
            dailyRemaining: data.usage?.daily_remaining ?? data.usage?.dailyRemaining ?? 0,
            monthlyRemaining: data.usage?.monthly_remaining ?? data.usage?.monthlyRemaining ?? 0,
            lifetimeRemaining: data.usage?.lifetime_remaining ?? data.usage?.lifetimeRemaining,
            canAsk: data.allowed ?? true,
            limitMessage: data.usage?.limit_message || data.message,
          });
        }
      } catch {
        // Keep defaults
      }

      // Fetch profiles
      try {
        const response = await api.listPersonProfiles();
        const data = response.data as any;
        if (data?.profiles) {
          setProfiles(data.profiles);
          const primary = data.profiles.find((p: Profile) => p.is_primary);
          if (primary) {
            setCurrentProfile(primary);
          } else if (data.profiles.length > 0) {
            setCurrentProfile(data.profiles[0]);
          }
        }
      } catch {
        // Keep empty
      }
    };

    initializeChat();
  }, [authLoading, isAuthenticated, hasProfile, initialized]);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (chatSessions.length > 0 && userId) {
      const storageKey = getStorageKey('astravaani_sessions', userId);
      localStorage.setItem(storageKey, JSON.stringify(chatSessions));
    }
  }, [chatSessions, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !usage.canAsk) return;

    // Ensure we have a session
    let sessionId = currentSessionId;
    if (!sessionId || !chatSessions.find(s => s.id === sessionId)) {
      sessionId = createNewSession();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Update session with new message
    setChatSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const isFirstMessage = s.messages.length === 0;
        return {
          ...s,
          title: isFirstMessage ? generateTitle(input.trim()) : s.title,
          messages: [...s.messages, userMessage],
          updatedAt: new Date(),
        };
      }
      return s;
    }));

    setInput('');
    setIsLoading(true);

    try {
      const response = await api.askGuidance({ question: input.trim() });
      const data = response.data as any;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.full_response || data?.fullResponse || data?.empathy_line || data?.empathyLine || 'I received your message.',
        timestamp: new Date(),
        metadata: {
          dataPointsUsed: data?.data_points_used || data?.dataPointsUsed || [],
          validationPassed: data?.validation?.passed ?? true,
        },
      };

      setChatSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantMessage],
            updatedAt: new Date(),
          };
        }
        return s;
      }));

      // Refresh usage
      try {
        const usageResponse = await api.checkUsage();
        const usageData = usageResponse.data as any;
        const tier = (usageData?.usage?.tier || 'free').toLowerCase();
        setUsage({
          tier: tier as 'free' | 'starter' | 'pro',
          dailyRemaining: usageData?.usage?.daily_remaining ?? usageData?.usage?.dailyRemaining ?? 0,
          monthlyRemaining: usageData?.usage?.monthly_remaining ?? usageData?.usage?.monthlyRemaining ?? 0,
          lifetimeRemaining: usageData?.usage?.lifetime_remaining ?? usageData?.usage?.lifetimeRemaining,
          canAsk: usageData?.allowed ?? false,
          limitMessage: usageData?.usage?.limit_message || usageData?.usage?.limitMessage,
        });
      } catch {
        setUsage(prev => ({
          ...prev,
          dailyRemaining: Math.max(0, prev.dailyRemaining - 1),
          monthlyRemaining: Math.max(0, prev.monthlyRemaining - 1),
          lifetimeRemaining: prev.tier === 'free' ? Math.max(0, (prev.lifetimeRemaining ?? 0) - 1) : prev.lifetimeRemaining,
          canAsk: prev.tier === 'free' ? (prev.lifetimeRemaining ?? 0) > 1 : prev.dailyRemaining > 1,
        }));
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.response?.data?.detail || 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setChatSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMessage],
            updatedAt: new Date(),
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading || (!isAuthenticated && !initialized)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md flex flex-col"
          >
            {/* Sidebar header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <button
                onClick={() => createNewSession()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto py-2">
              {chatSessions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {chatSessions.map(session => (
                    <div
                      key={session.id}
                      className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                        session.id === currentSessionId
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                      onClick={() => setCurrentSessionId(session.id)}
                    >
                      <svg className="w-5 h-5 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {session.messages.length} messages
                        </p>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="absolute right-2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar footer */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10">
              <div className="text-xs text-gray-500 text-center">
                {chatSessions.length} conversation{chatSessions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-none px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold gradient-text">AstraVaani</h1>
              <span className="px-2 py-1 text-xs bg-cosmic-100 dark:bg-cosmic-900/30 text-cosmic-700 dark:text-cosmic-300 rounded-full">
                Both Mode
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Usage indicator */}
              <div className="text-sm text-gray-500 hidden sm:block">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {usage.tier === 'free' ? (usage.lifetimeRemaining ?? 0) : usage.dailyRemaining}
                </span>{' '}
                {usage.tier === 'free' ? 'free questions left' : 'questions left today'}
              </div>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: currentProfile?.avatar_color || '#7C3AED' }}
                  >
                    {currentProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {currentProfile?.nickname || currentProfile?.name || 'Profile'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 py-2 z-50">
                    {currentProfile && (
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Profile</p>
                        <p className="font-medium">{currentProfile.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{currentProfile.relationship}</p>
                      </div>
                    )}

                    {profiles.length > 1 && (
                      <div className="py-2 border-b border-gray-100 dark:border-white/10">
                        <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-1">Switch Profile</p>
                        {profiles.filter(p => p.id !== currentProfile?.id).map((profile) => (
                          <button
                            key={profile.id}
                            onClick={() => {
                              setCurrentProfile(profile);
                              setShowProfileMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3"
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                              style={{ backgroundColor: profile.avatar_color || '#7C3AED' }}
                            >
                              {profile.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{profile.nickname || profile.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{profile.relationship}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowSettingsModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Manage Profiles
                      </Link>
                      <Link
                        href="/pricing"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Subscription
                      </Link>
                      <button
                        onClick={() => {
                          if (userId) {
                            localStorage.removeItem(getStorageKey('astravaani_sessions', userId));
                          }
                          localStorage.removeItem('astravaani_last_user');
                          api.clearToken();
                          router.push('/login');
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <WelcomeMessage onQuestionClick={(q) => {
                setInput(q);
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }, 100);
              }} />
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
            )}

            {isLoading && <LoadingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-none px-4 py-4 border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            {!usage.canAsk ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">{usage.limitMessage || 'Daily limit reached'}</p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-full text-sm font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
                >
                  Upgrade for More
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your patterns..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                  ) : (
                    'Ask'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold">Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Response Style */}
                <div>
                  <h3 className="font-semibold mb-3">Communication Style</h3>
                  <p className="text-sm text-gray-500 mb-4">How should I talk to you?</p>
                  <div className="space-y-2">
                    {[
                      { value: 'supportive', label: 'Supportive', desc: 'Warm, encouraging, emotionally supportive', icon: '💝' },
                      { value: 'balanced', label: 'Balanced', desc: 'Mix of warmth and practical insights', icon: '⚖️' },
                      { value: 'direct', label: 'Direct', desc: 'Blunt, precise, no sugar coating', icon: '🎯' },
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setResponseStyle(style.value as any)}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                          responseStyle === style.value
                            ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                            : 'bg-gray-50 dark:bg-white/5 border-2 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="text-2xl">{style.icon}</span>
                        <div>
                          <p className="font-medium">{style.label}</p>
                          <p className="text-sm text-gray-500">{style.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h3 className="font-semibold mb-3">Language</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'hinglish', label: 'Hinglish', desc: 'Hindi-English mix (Roman script)' },
                      { value: 'en', label: 'English', desc: 'Clear, simple English' },
                      { value: 'hi', label: 'हिंदी', desc: 'Hindi (Devanagari script)' },
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => setLanguage(lang.value as any)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          language === lang.value
                            ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                            : 'bg-gray-50 dark:bg-white/5 border-2 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                        }`}
                      >
                        <p className="font-medium">{lang.label}</p>
                        <p className="text-sm text-gray-500">{lang.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      await api.updateProfile({
                        response_style: responseStyle,
                        language: language,
                      });
                      setShowSettingsModal(false);
                    } catch (err) {
                      console.error('Failed to save settings:', err);
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  disabled={savingSettings}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WelcomeMessage({ onQuestionClick }: { onQuestionClick: (question: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-cosmic-500 flex items-center justify-center">
        <span className="text-3xl">✨</span>
      </div>
      <h2 className="text-2xl font-bold mb-3">Welcome to AstraVaani</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Ask questions about your life patterns. I&apos;ll provide guidance based on
        your computed chart data.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {[
          'What does my chart say about my career?',
          'How can I improve my relationships?',
          'What are my natural strengths?',
          'What should I be mindful of this month?',
        ].map((question) => (
          <button
            key={question}
            onClick={() => onQuestionClick(question)}
            className="p-3 text-sm text-left rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {question}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-2xl rounded-br-md'
            : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl rounded-bl-md'
        } px-4 py-3`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-base prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {!isUser && message.metadata?.dataPointsUsed && message.metadata.dataPointsUsed.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
            <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Based on: {message.metadata.dataPointsUsed.join(', ')}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-500">Consulting your chart...</span>
        </div>
      </div>
    </motion.div>
  );
}
