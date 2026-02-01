'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { DashaTimeline } from '@/components/DashaTimeline';
import { YogasDisplay } from '@/components/YogasDisplay';

type ViewMode = 'dasha' | 'yogas';

export default function VedicPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dasha');

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/login?redirect=/vedic');
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900/10 via-transparent to-indigo-900/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            AstraVaani
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!authLoading && isAuthenticated && (
              <Link
                href="/chat"
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-lg text-sm font-medium hover:from-primary-500 hover:to-cosmic-500"
              >
                Go to Chat
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          <span className="gradient-text">Vedic Astrology</span>
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore your Vimshottari Dasha timeline and discover the powerful Yoga combinations in your birth chart.
        </p>
      </section>

      {/* View Toggle */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setViewMode('dasha')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === 'dasha'
                  ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>☽</span>
              Dasha Periods
            </button>
            <button
              onClick={() => setViewMode('yogas')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === 'yogas'
                  ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>✨</span>
              Yoga Combinations
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'dasha' ? (
            <DashaTimeline />
          ) : (
            <YogasDisplay />
          )}
        </motion.div>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">☽</span>
            </div>
            <h3 className="font-semibold mb-2">Vimshottari Dasha</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The 120-year planetary period system based on your Moon nakshatra, revealing life's timing and themes.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">👑</span>
            </div>
            <h3 className="font-semibold mb-2">Yoga Combinations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Special planetary combinations that indicate unique talents, blessings, and life patterns.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔮</span>
            </div>
            <h3 className="font-semibold mb-2">Vedic Wisdom</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ancient astrological techniques refined over thousands of years for deeper self-understanding.
            </p>
          </div>
        </div>

        {/* Navigation to other features */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Explore more features</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/cosmos"
              className="px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <span>☉</span>
              Planetary Positions
            </Link>
            <Link
              href="/chat"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl shadow hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>💬</span>
              Ask Questions
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
