import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateBreadcrumbSchema } from '@/lib/seo';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mercury Retrograde 2026: Dates, Effects & Survival Tips',
  description:
    'Complete guide to Mercury Retrograde in 2026. Get the exact dates, understand the effects on communication, technology and travel, plus practical survival tips.',
  keywords: [
    'mercury retrograde 2026',
    'mercury retrograde dates 2026',
    'mercury retrograde effects',
    'mercury retrograde meaning',
    'budh vakri 2026',
    'retrograde astrology',
    'mercury retrograde survival',
    'what to avoid mercury retrograde',
    'mercury retrograde communication',
  ],
  alternates: {
    canonical: '/blog/mercury-retrograde-2026',
  },
  openGraph: {
    title: 'Mercury Retrograde 2026: Complete Survival Guide',
    description: 'All dates, effects, and practical tips to navigate Mercury Retrograde periods in 2026.',
    type: 'article',
    publishedTime: '2026-01-05T00:00:00Z',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Mercury Retrograde 2026: Dates, Effects & Survival Tips',
  description: 'A comprehensive guide to Mercury Retrograde periods in 2026 with dates and practical advice.',
  author: { '@type': 'Organization', name: 'AstraVaani' },
  publisher: { '@type': 'Organization', name: 'AstraVaani' },
  datePublished: '2026-01-05',
  dateModified: '2026-01-27',
};

const breadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: 'Mercury Retrograde 2026', url: '/blog/mercury-retrograde-2026' },
]);

const retrogradePeriodsDetailed = [
  {
    period: 'First Retrograde',
    dates: 'February 25 - March 20, 2026',
    sign: 'Pisces → Aquarius',
    element: 'Water/Air',
    shadow: 'Feb 9 - Apr 3',
    themes: 'Intuition vs logic, dreams vs reality, spiritual communication',
    tips: 'Journal your dreams, revisit creative projects, be careful with sensitive conversations',
  },
  {
    period: 'Second Retrograde',
    dates: 'June 18 - July 12, 2026',
    sign: 'Cancer → Gemini',
    element: 'Water/Air',
    shadow: 'June 1 - July 28',
    themes: 'Home matters, family communication, emotional expression',
    tips: 'Reconnect with family, handle home repairs carefully, avoid major purchases for home',
  },
  {
    period: 'Third Retrograde',
    dates: 'October 13 - November 3, 2026',
    sign: 'Scorpio → Libra',
    element: 'Water/Air',
    shadow: 'Sept 27 - Nov 18',
    themes: 'Relationship dynamics, shared finances, deep conversations',
    tips: 'Review joint finances, have honest relationship talks, avoid major commitments',
  },
];

const dosDonts = {
  dos: [
    { icon: '✓', text: 'Review and revise existing projects', reason: 'Great time for refinement' },
    { icon: '✓', text: 'Back up all digital data', reason: 'Technology glitches are common' },
    { icon: '✓', text: 'Reconnect with old friends', reason: 'Re-connections are favored' },
    { icon: '✓', text: 'Double-check travel plans', reason: 'Delays and mix-ups happen' },
    { icon: '✓', text: 'Re-read contracts before signing', reason: 'Details matter more now' },
    { icon: '✓', text: 'Practice patience in communication', reason: 'Misunderstandings increase' },
  ],
  donts: [
    { icon: '✗', text: 'Sign major contracts', reason: 'Hidden issues may surface later' },
    { icon: '✗', text: 'Buy new electronics', reason: 'Higher chance of defects' },
    { icon: '✗', text: 'Start new ventures', reason: 'Better to wait for direct motion' },
    { icon: '✗', text: 'Make impulsive decisions', reason: 'Information may be incomplete' },
    { icon: '✗', text: 'Neglect communication clarity', reason: 'Say what you mean, mean what you say' },
    { icon: '✗', text: 'Ignore intuitive warnings', reason: 'Your inner voice is sharper now' },
  ],
};

export default function MercuryRetrograde2026() {
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
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-cyan-900/30 to-blue-900/40" />
          <div className="absolute inset-0">
            <div className="stars" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full text-teal-300 text-sm font-medium mb-6">
              Planetary Transits • 9 min read
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Mercury Retrograde 2026: Your Complete Survival Guide
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Three times in 2026, Mercury appears to move backward. Here&apos;s everything you
              need to know to navigate these periods with grace.
            </p>
            <div className="text-gray-400 text-sm">
              January 2026 • Updated January 27, 2026
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Intro */}
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Mercury Retrograde is perhaps the most talked-about astrological event, and for good
              reason. As the planet governing communication, technology, travel, and commerce appears
              to reverse course, these areas of life often feel the impact. But is it really all
              doom and gloom? Let&apos;s separate fact from fear.
            </p>

            {/* What is Mercury Retrograde */}
            <section className="my-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-2xl">
                  ☿
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white m-0">
                    What is Mercury Retrograde?
                  </h2>
                  <p className="text-gray-500 m-0">The Cosmic Illusion</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 m-0">
                  Mercury doesn&apos;t actually move backward. Due to the relative positions
                  and speeds of Earth and Mercury in their orbits, Mercury <em>appears</em> to
                  reverse direction from our vantage point. This optical illusion occurs about
                  <strong> three to four times per year</strong>, lasting roughly three weeks each time.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800 text-center">
                  <div className="text-3xl mb-3">💬</div>
                  <div className="font-semibold text-gray-800 dark:text-white text-sm">Communication</div>
                  <div className="text-xs text-gray-500 mt-1">Miscommunications, lost messages, unclear expression</div>
                </div>
                <div className="bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800 text-center">
                  <div className="text-3xl mb-3">💻</div>
                  <div className="font-semibold text-gray-800 dark:text-white text-sm">Technology</div>
                  <div className="text-xs text-gray-500 mt-1">Glitches, data loss, device malfunctions</div>
                </div>
                <div className="bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800 text-center">
                  <div className="text-3xl mb-3">✈️</div>
                  <div className="font-semibold text-gray-800 dark:text-white text-sm">Travel</div>
                  <div className="text-xs text-gray-500 mt-1">Delays, cancellations, lost luggage</div>
                </div>
              </div>
            </section>

            {/* 2026 Dates */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Mercury Retrograde Dates in 2026
              </h2>

              <div className="space-y-6">
                {retrogradePeriodsDetailed.map((period, index) => (
                  <div
                    key={period.period}
                    className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-white">{period.period}</span>
                      </div>
                      <span className="text-white/90 text-sm">{period.sign}</span>
                    </div>
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500 mb-1">Retrograde Period</p>
                          <p className="text-gray-800 dark:text-white font-medium">{period.dates}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 mb-1">Shadow Period</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{period.shadow}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Key Themes</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{period.themes}</p>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                        <p className="text-sm text-teal-800 dark:text-teal-200 m-0">
                          <strong>Tips:</strong> {period.tips}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shadow Period */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Understanding the Shadow Period
              </h2>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  The effects of Mercury Retrograde don&apos;t begin and end abruptly. The
                  <strong> shadow period</strong> (or retroshade) extends about two weeks before
                  and after the actual retrograde:
                </p>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Pre-Shadow</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Effects begin subtly. A preview of themes to come. Good time to wrap up projects.
                    </p>
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4 border border-teal-200 dark:border-teal-700">
                    <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">Retrograde</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Full retrograde effects. Time for review, reflection, and re-doing.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Post-Shadow</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Effects gradually diminish. Integration of lessons. Forward momentum returns.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Do's and Don'ts */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Mercury Retrograde Do&apos;s and Don&apos;ts
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Do&apos;s
                  </h3>
                  <ul className="space-y-3">
                    {dosDonts.dos.map((item, i) => (
                      <li key={i} className="text-sm">
                        <p className="font-medium text-gray-800 dark:text-white">{item.text}</p>
                        <p className="text-gray-500 text-xs">{item.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✗</span> Avoid
                  </h3>
                  <ul className="space-y-3">
                    {dosDonts.donts.map((item, i) => (
                      <li key={i} className="text-sm">
                        <p className="font-medium text-gray-800 dark:text-white">{item.text}</p>
                        <p className="text-gray-500 text-xs">{item.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* The Power of RE */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                The Power of &quot;RE&quot; Activities
              </h2>

              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Mercury Retrograde is perfect for anything starting with &quot;RE&quot;:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  {['Review', 'Reflect', 'Revise', 'Reconnect', 'Research', 'Reorganize', 'Repair', 'Redo'].map((word) => (
                    <div
                      key={word}
                      className="bg-white dark:bg-white/10 rounded-lg p-3 text-sm font-medium text-teal-700 dark:text-teal-300"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* By Zodiac Sign */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                How Each Sign Can Navigate 2026 Retrogrades
              </h2>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { sign: 'Aries', advice: 'Focus on healing past wounds in relationships. Patience is your ally.' },
                  { sign: 'Taurus', advice: 'Review finances and values. Past creative projects may resurface.' },
                  { sign: 'Gemini', advice: 'Mercury is your ruler - extra self-care needed. Great for introspection.' },
                  { sign: 'Cancer', advice: 'Revisit family matters. Home improvements need careful planning.' },
                  { sign: 'Leo', advice: 'Past communications return. Old friends may reconnect.' },
                  { sign: 'Virgo', advice: 'Also Mercury-ruled. Financial review is favored. Trust your intuition.' },
                  { sign: 'Libra', advice: 'Partnership communication needs attention. Be clear about needs.' },
                  { sign: 'Scorpio', advice: 'Deep conversations about shared resources. Transformation themes.' },
                  { sign: 'Sagittarius', advice: 'Travel plans need flexibility. Educational pursuits may shift.' },
                  { sign: 'Capricorn', advice: 'Career communications need clarity. Review long-term goals.' },
                  { sign: 'Aquarius', advice: 'First retrograde hits your sign. Major personal review period.' },
                  { sign: 'Pisces', advice: 'Intuition is heightened. Past dreams may provide guidance.' },
                ].map((item) => (
                  <div
                    key={item.sign}
                    className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-100 dark:border-gray-800"
                  >
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{item.sign}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.advice}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reality Check */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                A Reality Check
              </h2>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  While Mercury Retrograde correlates with certain patterns, remember:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Technology can fail any time - we just notice it more during retrograde</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Millions of contracts are successfully signed during retrograde</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Your awareness and intention matter more than planetary positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Use this as a mindfulness tool, not a source of anxiety</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* CTA */}
            <section className="my-12 bg-gradient-to-r from-primary-600 to-cosmic-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">
                Get Personalized Retrograde Guidance
              </h2>
              <p className="text-white/80 mb-6">
                Want to know exactly how Mercury Retrograde affects your specific birth chart?
                AstraVaani can analyze your Mercury placement and current transits.
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
              >
                Check My Retrograde Report Free
              </Link>
            </section>

            {/* Disclaimer */}
            <div className="text-sm text-gray-500 dark:text-gray-500 italic mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <strong>Remember:</strong> Mercury Retrograde isn&apos;t a time to hide under the covers.
              It&apos;s an invitation to slow down, review, and refine. The best way through any
              retrograde is with awareness, flexibility, and a sense of humor about life&apos;s quirks.
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
