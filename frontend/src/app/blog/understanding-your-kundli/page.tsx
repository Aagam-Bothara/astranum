import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Understanding Your Kundli: A Beginner\'s Guide to Vedic Birth Charts',
  description:
    'Learn how to read your Kundli (Vedic birth chart). Understand the 12 houses, planets, signs, and what they reveal about your life, career, relationships, and destiny.',
  keywords: [
    'kundli',
    'kundali',
    'vedic birth chart',
    'birth chart reading',
    'janam kundli',
    'horoscope chart',
    'vedic astrology chart',
    'how to read kundli',
    'kundli houses meaning',
    'planets in astrology',
  ],
  alternates: {
    canonical: '/blog/understanding-your-kundli',
  },
  openGraph: {
    title: 'Understanding Your Kundli: Complete Guide to Vedic Birth Charts',
    description: 'Master the basics of reading your Kundli and unlock the secrets of Vedic astrology.',
    type: 'article',
    publishedTime: '2026-01-10T00:00:00Z',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Understanding Your Kundli: A Beginner\'s Guide to Vedic Birth Charts',
  description: 'A comprehensive guide to understanding and reading your Vedic birth chart (Kundli).',
  author: { '@type': 'Organization', name: 'AstraVaani' },
  publisher: { '@type': 'Organization', name: 'AstraVaani' },
  datePublished: '2026-01-10',
  dateModified: '2026-01-27',
};

const breadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: 'Understanding Your Kundli', url: '/blog/understanding-your-kundli' },
]);

const houses = [
  { num: 1, name: 'Lagna/Ascendant', rules: 'Self, personality, physical body, life approach', planet: 'Sun' },
  { num: 2, name: 'Dhana Bhava', rules: 'Wealth, family, speech, food, early education', planet: 'Jupiter' },
  { num: 3, name: 'Sahaja Bhava', rules: 'Siblings, courage, short travels, communication', planet: 'Mars' },
  { num: 4, name: 'Sukha Bhava', rules: 'Mother, home, property, vehicles, emotional peace', planet: 'Moon' },
  { num: 5, name: 'Putra Bhava', rules: 'Children, creativity, romance, education, past karma', planet: 'Jupiter' },
  { num: 6, name: 'Ari Bhava', rules: 'Health, enemies, debts, service, daily work', planet: 'Mars' },
  { num: 7, name: 'Kalatra Bhava', rules: 'Marriage, partnerships, business, public dealings', planet: 'Venus' },
  { num: 8, name: 'Randhra Bhava', rules: 'Transformation, death, inheritance, occult, longevity', planet: 'Saturn' },
  { num: 9, name: 'Dharma Bhava', rules: 'Fortune, father, religion, higher learning, long travels', planet: 'Jupiter' },
  { num: 10, name: 'Karma Bhava', rules: 'Career, status, authority, public image, achievements', planet: 'Sun/Saturn' },
  { num: 11, name: 'Labha Bhava', rules: 'Gains, income, friends, aspirations, elder siblings', planet: 'Jupiter' },
  { num: 12, name: 'Vyaya Bhava', rules: 'Losses, expenses, foreign lands, moksha, isolation', planet: 'Saturn' },
];

const planets = [
  { name: 'Sun (Surya)', symbol: '☉', rules: 'Soul, ego, father, authority, vitality', nature: 'Malefic', color: 'amber' },
  { name: 'Moon (Chandra)', symbol: '☽', rules: 'Mind, emotions, mother, public, intuition', nature: 'Benefic', color: 'slate' },
  { name: 'Mars (Mangal)', symbol: '♂', rules: 'Energy, courage, siblings, property, passion', nature: 'Malefic', color: 'red' },
  { name: 'Mercury (Budh)', symbol: '☿', rules: 'Intelligence, communication, business, friends', nature: 'Neutral', color: 'green' },
  { name: 'Jupiter (Guru)', symbol: '♃', rules: 'Wisdom, expansion, children, wealth, teachers', nature: 'Benefic', color: 'yellow' },
  { name: 'Venus (Shukra)', symbol: '♀', rules: 'Love, beauty, marriage, arts, luxury', nature: 'Benefic', color: 'pink' },
  { name: 'Saturn (Shani)', symbol: '♄', rules: 'Karma, discipline, delays, longevity, hard work', nature: 'Malefic', color: 'blue' },
  { name: 'Rahu', symbol: '☊', rules: 'Obsession, foreign, unconventional, material desires', nature: 'Malefic', color: 'indigo' },
  { name: 'Ketu', symbol: '☋', rules: 'Spirituality, past lives, detachment, moksha', nature: 'Malefic', color: 'purple' },
];

export default function UnderstandingYourKundli() {
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-violet-900/40" />
          <div className="absolute inset-0">
            <div className="stars" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full text-indigo-300 text-sm font-medium mb-6">
              Vedic Astrology • 15 min read
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Understanding Your Kundli: A Beginner&apos;s Guide
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your Kundli is a cosmic snapshot of the sky at your birth moment.
              Learn to decode its secrets and understand your life&apos;s blueprint.
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
              A Kundli (also spelled Kundali) is your Vedic birth chart - a map of where all the planets
              were positioned at the exact moment and location of your birth. Unlike Western astrology,
              Vedic astrology (Jyotish) uses the sidereal zodiac, making it astronomically precise and
              deeply connected to actual star positions.
            </p>

            {/* What is Kundli */}
            <section className="my-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
                  📜
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white m-0">
                    What Makes a Kundli?
                  </h2>
                  <p className="text-gray-500 m-0">The Three Essential Elements</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">📅</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Birth Date</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Day, month, and year determine planetary positions in the zodiac
                  </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">⏰</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Birth Time</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crucial for calculating your Ascendant (Lagna) and house placements
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">📍</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Birth Place</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Latitude and longitude fine-tune the chart to your exact location
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border-l-4 border-amber-500">
                <p className="text-amber-800 dark:text-amber-200 m-0">
                  <strong>Why birth time matters:</strong> The Ascendant (rising sign) changes approximately
                  every 2 hours. An incorrect time can result in a completely different chart interpretation.
                  If you don&apos;t know your exact time, check your birth certificate or ask family members.
                </p>
              </div>
            </section>

            {/* The 12 Houses */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                The 12 Houses (Bhavas): Life&apos;s Departments
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your Kundli is divided into 12 houses, each governing different areas of life.
                The sign and planets in each house color how those life areas manifest for you.
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                {houses.map((house) => (
                  <div
                    key={house.num}
                    className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-100 dark:border-gray-800 flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {house.num}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white text-sm">{house.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{house.rules}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">House Categories:</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 dark:text-green-400 font-medium">Kendra (Angular):</span>
                    <span className="text-gray-600 dark:text-gray-400"> 1, 4, 7, 10 - Power houses</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Trikona (Trine):</span>
                    <span className="text-gray-600 dark:text-gray-400"> 1, 5, 9 - Lucky houses</span>
                  </div>
                  <div>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">Dusthana:</span>
                    <span className="text-gray-600 dark:text-gray-400"> 6, 8, 12 - Challenging houses</span>
                  </div>
                </div>
              </div>
            </section>

            {/* The 9 Planets */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                The 9 Planets (Navagraha): Cosmic Influencers
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Vedic astrology uses 9 celestial bodies called Grahas. Each carries unique energy
                and governs specific life areas.
              </p>

              <div className="space-y-3">
                {planets.map((planet) => (
                  <div
                    key={planet.name}
                    className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{planet.symbol}</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{planet.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        planet.nature === 'Benefic' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        planet.nature === 'Malefic' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {planet.nature}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{planet.rules}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reading Tips */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                How to Start Reading Your Kundli
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Find Your Ascendant (Lagna)</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Your Ascendant sign sets the framework. It&apos;s always in the 1st house and represents
                      your personality, physical body, and approach to life.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Check Your Moon Sign (Rashi)</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      In Vedic astrology, your Moon sign is as important as Sun sign in Western astrology.
                      It reveals your emotional nature and mind.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Identify Strong Houses</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Houses with benefic planets (Jupiter, Venus, well-placed Moon/Mercury) indicate areas
                      of natural ease and blessings in your life.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Look at Planetary Aspects</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Planets influence other houses through aspects. For example, Saturn aspects 3rd, 7th,
                      and 10th houses from its position.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Check the Dashas</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      The Dasha system reveals planetary time periods. Which Dasha you&apos;re running tells
                      you which planet&apos;s themes are active now.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="my-12 bg-gradient-to-r from-primary-600 to-cosmic-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">
                Get Your Free Kundli Analysis
              </h2>
              <p className="text-white/80 mb-6">
                Let AstraVaani&apos;s AI interpret your birth chart and reveal personalized insights
                about your career, relationships, health, and life path.
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
              >
                Generate My Free Kundli
              </Link>
            </section>

            {/* Disclaimer */}
            <div className="text-sm text-gray-500 dark:text-gray-500 italic mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <strong>Note:</strong> Kundli reading is a complex art that takes years to master.
              This guide covers fundamentals - a complete interpretation requires analyzing
              multiple factors including yogas, aspects, and dashas together.
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
    </>
  );
}
