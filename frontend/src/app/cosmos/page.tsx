'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PlanetaryPositions from '@/components/PlanetaryPositions';
import BirthChart from '@/components/BirthChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

type ViewMode = 'transits' | 'chart';

export default function CosmosPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('transits');

  return (
    <main className="min-h-screen bg-gradient-to-b from-cosmic-900/10 via-transparent to-primary-900/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            AstraVaani
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isLoading && (
              isAuthenticated ? (
                <Link
                  href="/chat"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-lg text-sm font-medium hover:from-primary-500 hover:to-cosmic-500"
                >
                  Go to Chat
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-lg text-sm font-medium hover:from-primary-500 hover:to-cosmic-500"
                >
                  Login
                </Link>
              )
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
          <span className="gradient-text">Cosmic Dashboard</span>
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore real-time planetary positions and your personal Kundli chart.
          Click on any planet to learn more about its influence.
        </p>
      </section>

      {/* View Toggle */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setViewMode('transits')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'transits'
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Current Transits
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              My Birth Chart
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
          {viewMode === 'transits' ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
              <PlanetaryPositions showTitle />
            </div>
          ) : (
            <BirthChart />
          )}
        </motion.div>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">☉</span>
            </div>
            <h3 className="font-semibold mb-2">Real-Time Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Planetary positions are calculated using Swiss Ephemeris for astronomical accuracy.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔮</span>
            </div>
            <h3 className="font-semibold mb-2">Vedic Astrology</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All calculations use the Sidereal zodiac with Lahiri Ayanamsa, the most common system in India.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Personal Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Paid subscribers can view their complete birth chart with detailed planetary analysis.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
