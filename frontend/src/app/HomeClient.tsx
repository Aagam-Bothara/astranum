'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeClient() {
  const { isAuthenticated, isLoading, user, hasProfile } = useAuth();

  // Get user display name
  const userName = user ? ((user as any).display_name || (user as any).full_name || (user as any).fullName || null) : null;

  // Determine where to go - if user has profile, go to chat, otherwise onboard
  const userDestination = hasProfile ? '/chat' : '/onboard';

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            AstraVaani
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {!isLoading && (
              isAuthenticated ? (
                <Link
                  href={userDestination}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full hover:bg-white/20 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-cosmic-500 flex items-center justify-center text-white text-sm font-medium">
                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {hasProfile ? 'Go to Chat' : 'Complete Setup'}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-full hover:from-primary-500 hover:to-cosmic-500 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-900/20 via-primary-900/10 to-transparent" />

        {/* Stars decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">AstraVaani</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Vedic Astrology & Numerology Guidance
          </p>

          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Discover clarity through computed astrological and numerological
            patterns. We guide using mathematics and astronomy — not predictions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboard"
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-full font-semibold text-lg hover:from-primary-500 hover:to-cosmic-500 transition-all shadow-lg hover:shadow-xl"
            >
              Begin Your Journey
            </Link>

            <Link
              href="/cosmos"
              className="px-8 py-4 bg-white/10 backdrop-blur text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 rounded-full font-semibold text-lg hover:bg-white/20 transition-all"
            >
              View Planetary Positions
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white/50 dark:bg-black/20" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-center mb-16">
            How <span className="gradient-text">AstraVaani</span> Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <article className="p-8 rounded-2xl bg-white dark:bg-white/5 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-cosmic-500 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Computed, Not Guessed</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your chart is calculated using Swiss Ephemeris for astrology and
                precise mathematics for numerology. Every data point is verified.
              </p>
            </article>

            {/* Feature 2 */}
            <article className="p-8 rounded-2xl bg-white dark:bg-white/5 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-cosmic-500 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Guidance, Not Prediction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We explain patterns and tendencies. You have free will. Our AI
                guides you — it never claims to predict your future.
              </p>
            </article>

            {/* Feature 3 */}
            <article className="p-8 rounded-2xl bg-white dark:bg-white/5 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-cosmic-500 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Validated Responses</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every AI response is validated to ensure it only references your
                actual chart data. No hallucinations, no invented facts.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Your Patterns?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Start with 2 free questions. No credit card required.
          </p>
          <Link
            href="/onboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-full font-semibold text-lg hover:from-primary-500 hover:to-cosmic-500 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
