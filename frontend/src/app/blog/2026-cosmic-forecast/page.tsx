import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateBreadcrumbSchema } from '@/lib/seo';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '2026 Cosmic Forecast: Major Planetary Movements & What They Mean',
  description:
    'Discover what 2026 holds according to Vedic astrology. Saturn in Pisces, Jupiter transits, Rahu-Ketu axis shifts, and how these cosmic movements may influence your life.',
  keywords: [
    '2026 astrology predictions',
    '2026 horoscope',
    'saturn pisces 2026',
    'jupiter transit 2026',
    'rahu ketu 2026',
    'vedic astrology 2026',
    'yearly horoscope 2026',
    'planetary transits 2026',
  ],
  alternates: {
    canonical: '/blog/2026-cosmic-forecast',
  },
  openGraph: {
    title: '2026 Cosmic Forecast: What the Stars Hold for You',
    description: 'A comprehensive guide to major planetary movements of 2026 and their potential influence on your life path.',
    type: 'article',
    publishedTime: '2026-01-01T00:00:00Z',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '2026 Cosmic Forecast: What the Stars Hold for You',
  description: 'A comprehensive guide to the major planetary movements of 2026.',
  author: { '@type': 'Organization', name: 'AstraVaani' },
  publisher: { '@type': 'Organization', name: 'AstraVaani' },
  datePublished: '2026-01-01',
  dateModified: '2026-01-27',
};

const breadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: '2026 Cosmic Forecast', url: '/blog/2026-cosmic-forecast' },
]);

export default function CosmicForecast2026() {
  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <header className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-indigo-900/40" />
          <div className="absolute inset-0">
            <div className="stars" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full text-purple-300 text-sm font-medium mb-6">
              Predictions • 8 min read
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              2026 Cosmic Forecast: What the Stars Hold for You
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              A comprehensive guide to the major planetary movements of 2026 and
              how they may influence your life path.
            </p>
            <div className="text-gray-400 text-sm">
              January 2026 • Updated January 27, 2026
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Intro */}
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              2026 brings a powerful cosmic symphony that promises transformation, growth, and
              new beginnings. Whether you&apos;re seeking career clarity, relationship insights,
              or spiritual growth, the planetary dance this year offers something for everyone.
            </p>

            {/* Saturn Section */}
            <section className="my-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-2xl">
                  🪐
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white m-0">
                    Saturn&apos;s Journey Through Pisces
                  </h2>
                  <p className="text-gray-500 m-0">The Teacher&apos;s Spiritual Lessons</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 m-0">
                  Saturn continues its transit through <strong>Pisces (Meena Rashi)</strong>,
                  bringing karmic lessons around spirituality, boundaries, and compassion.
                  This transit encourages us to find structure within chaos and to ground
                  our spiritual aspirations in practical reality.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Who feels this most?
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><strong>Pisces Moon/Ascendant:</strong> Direct impact on self, identity, and life direction</li>
                <li><strong>Virgo Moon/Ascendant:</strong> Relationship dynamics and partnerships</li>
                <li><strong>Gemini & Sagittarius:</strong> Career and home life adjustments</li>
                <li><strong>Those aged 27-30:</strong> Experiencing Saturn Return - a pivotal life chapter</li>
              </ul>
            </section>

            {/* Jupiter Section */}
            <section className="my-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
                  ✨
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white m-0">
                    Jupiter&apos;s Expansion Energy
                  </h2>
                  <p className="text-gray-500 m-0">Growth, Abundance & Opportunity</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 m-0">
                  Jupiter, the great benefic, brings opportunities for growth and expansion.
                  In 2026, Jupiter&apos;s transit emphasizes <strong>education, philosophy,
                  long-distance connections,</strong> and <strong>higher learning</strong>.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Key Opportunities This Year
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-2">📚</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Education</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Excellent year for higher studies, certifications, and skill development
                  </p>
                </div>
                <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-2">✈️</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Travel</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Long-distance travel brings growth and meaningful connections
                  </p>
                </div>
                <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-2">🤝</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Networking</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Teachers, mentors, and guides appear when you&apos;re ready
                  </p>
                </div>
                <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-2">🙏</div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Spirituality</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Deepening faith and philosophical understanding
                  </p>
                </div>
              </div>
            </section>

            {/* Rahu-Ketu Section */}
            <section className="my-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-2xl">
                  🌑
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white m-0">
                    Rahu-Ketu: The Nodes of Destiny
                  </h2>
                  <p className="text-gray-500 m-0">Karmic Lessons & Soul Growth</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 m-0">
                  The lunar nodes (Rahu & Ketu) represent our karmic path - where we&apos;re
                  headed (Rahu) and what we&apos;re releasing (Ketu). Their 2026 positions
                  emphasize <strong>material vs. spiritual balance</strong>.
                </p>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-xl p-6 border-l-4 border-purple-500">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Eclipse Season Alert
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm m-0">
                  Eclipses in 2026 occur along the Rahu-Ketu axis. These are powerful times
                  for releasing old patterns and embracing new directions. Mark your calendar
                  for eclipse dates and approach them with mindfulness.
                </p>
              </div>
            </section>

            {/* Sign-by-Sign Preview */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Quick Glance by Moon Sign
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { sign: 'Aries', emoji: '♈', theme: 'Spiritual renewal' },
                  { sign: 'Taurus', emoji: '♉', theme: 'Social expansion' },
                  { sign: 'Gemini', emoji: '♊', theme: 'Career evolution' },
                  { sign: 'Cancer', emoji: '♋', theme: 'Higher learning' },
                  { sign: 'Leo', emoji: '♌', theme: 'Transformation' },
                  { sign: 'Virgo', emoji: '♍', theme: 'Relationships' },
                  { sign: 'Libra', emoji: '♎', theme: 'Health & service' },
                  { sign: 'Scorpio', emoji: '♏', theme: 'Creativity & joy' },
                  { sign: 'Sagittarius', emoji: '♐', theme: 'Home & roots' },
                  { sign: 'Capricorn', emoji: '♑', theme: 'Communication' },
                  { sign: 'Aquarius', emoji: '♒', theme: 'Finances & values' },
                  { sign: 'Pisces', emoji: '♓', theme: 'Self-reinvention' },
                ].map((item) => (
                  <div
                    key={item.sign}
                    className="bg-white dark:bg-white/5 rounded-lg p-4 text-center border border-gray-100 dark:border-gray-800"
                  >
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className="font-semibold text-gray-800 dark:text-white text-sm">
                      {item.sign}
                    </div>
                    <div className="text-xs text-gray-500">{item.theme}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="my-12 bg-gradient-to-r from-primary-600 to-cosmic-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">
                Get Your Personalized 2026 Insights
              </h2>
              <p className="text-white/80 mb-6">
                This is a general overview. For guidance specific to your birth chart,
                try AstraVaani&apos;s AI-powered analysis.
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
              >
                Start Free - 2 Questions Included
              </Link>
            </section>

            {/* Disclaimer */}
            <div className="text-sm text-gray-500 dark:text-gray-500 italic mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <strong>Disclaimer:</strong> Astrology offers patterns, not predictions.
              These insights are meant for guidance and self-reflection, not as definitive
              statements about your future. You always have free will.
            </div>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline"
          >
            ← Back to all articles
          </Link>
        </div>
      </article>

      <Footer />
    </>
  );
}
