'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { DashaTimeline } from '@/components/DashaTimeline';
import { YogasDisplay } from '@/components/YogasDisplay';
import { MobileNav } from '@/components/MobileNav';

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
    <>
    <main className="min-h-screen bg-gradient-to-b from-purple-900/10 via-transparent to-indigo-900/10 pb-20 md:pb-0">
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
      <section className="py-8 md:py-12 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold mb-3 md:mb-4"
        >
          <span className="gradient-text">Vedic Astrology</span>
        </motion.h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
          Explore your Vimshottari Dasha timeline and discover the powerful Yoga combinations in your birth chart.
        </p>
      </section>

      {/* View Toggle */}
      <div className="max-w-6xl mx-auto px-4 mb-6 md:mb-8">
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('dasha')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                viewMode === 'dasha'
                  ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>☽</span>
              <span className="hidden xs:inline">Dasha</span> Periods
            </button>
            <button
              onClick={() => setViewMode('yogas')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                viewMode === 'yogas'
                  ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>✨</span>
              <span className="hidden xs:inline">Yoga</span> Combinations
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
        <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0">
              <span className="text-xl md:text-2xl">☽</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Vimshottari Dasha</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                The 120-year planetary period system based on your Moon nakshatra.
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0">
              <span className="text-xl md:text-2xl">👑</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Yoga Combinations</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Special planetary combinations indicating unique talents and blessings.
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0">
              <span className="text-xl md:text-2xl">🔮</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Vedic Wisdom</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Ancient techniques refined over thousands of years.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation to other features */}
        <div className="mt-8 md:mt-12 text-center pb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Explore more features</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/cosmos"
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 text-sm"
            >
              <span>☉</span>
              Planetary Positions
            </Link>
            <Link
              href="/chat"
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>💬</span>
              Ask Questions
            </Link>
          </div>
        </div>
      </div>
    </main>
    <MobileNav />
    </>
  );
}
