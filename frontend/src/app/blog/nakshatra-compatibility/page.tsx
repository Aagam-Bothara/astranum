import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Nakshatra Compatibility Guide: Find Your Perfect Match in Vedic Astrology',
  description:
    'Discover Nakshatra compatibility for relationships and marriage. Learn how the 27 lunar mansions influence love, partnership dynamics, and kundli matching.',
  keywords: [
    'nakshatra compatibility',
    'nakshatra matching',
    'kundli matching',
    'marriage compatibility astrology',
    'nakshatra for marriage',
    'moon sign compatibility',
    'vedic astrology compatibility',
    'guna milan',
    'ashtakoot matching',
    '27 nakshatras',
  ],
  alternates: {
    canonical: '/blog/nakshatra-compatibility',
  },
  openGraph: {
    title: 'Nakshatra Compatibility: Your Guide to Vedic Love Matching',
    description: 'Understand how Nakshatras influence relationships and discover compatibility patterns in Vedic astrology.',
    type: 'article',
    publishedTime: '2026-01-08T00:00:00Z',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Nakshatra Compatibility Guide: Find Your Perfect Match in Vedic Astrology',
  description: 'A comprehensive guide to understanding Nakshatra compatibility for relationships and marriage.',
  author: { '@type': 'Organization', name: 'AstraVaani' },
  publisher: { '@type': 'Organization', name: 'AstraVaani' },
  datePublished: '2026-01-08',
  dateModified: '2026-01-27',
};

const breadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: 'Nakshatra Compatibility', url: '/blog/nakshatra-compatibility' },
]);

const nakshatras = [
  { name: 'Ashwini', ruler: 'Ketu', deity: 'Ashwini Kumaras', nature: 'Swift, healing, initiating', element: 'Fire' },
  { name: 'Bharani', ruler: 'Venus', deity: 'Yama', nature: 'Transformative, intense, creative', element: 'Fire' },
  { name: 'Krittika', ruler: 'Sun', deity: 'Agni', nature: 'Sharp, purifying, determined', element: 'Fire' },
  { name: 'Rohini', ruler: 'Moon', deity: 'Brahma', nature: 'Creative, fertile, charming', element: 'Earth' },
  { name: 'Mrigashira', ruler: 'Mars', deity: 'Soma', nature: 'Seeking, gentle, curious', element: 'Earth' },
  { name: 'Ardra', ruler: 'Rahu', deity: 'Rudra', nature: 'Transformative, stormy, intelligent', element: 'Water' },
  { name: 'Punarvasu', ruler: 'Jupiter', deity: 'Aditi', nature: 'Renewing, nurturing, hopeful', element: 'Water' },
  { name: 'Pushya', ruler: 'Saturn', deity: 'Brihaspati', nature: 'Nourishing, protective, wise', element: 'Water' },
  { name: 'Ashlesha', ruler: 'Mercury', deity: 'Nagas', nature: 'Mystical, hypnotic, intense', element: 'Water' },
  { name: 'Magha', ruler: 'Ketu', deity: 'Pitris', nature: 'Royal, ancestral, powerful', element: 'Fire' },
  { name: 'Purva Phalguni', ruler: 'Venus', deity: 'Bhaga', nature: 'Creative, romantic, luxurious', element: 'Fire' },
  { name: 'Uttara Phalguni', ruler: 'Sun', deity: 'Aryaman', nature: 'Service, friendship, contracts', element: 'Fire' },
  { name: 'Hasta', ruler: 'Moon', deity: 'Savitar', nature: 'Skillful, healing, practical', element: 'Earth' },
  { name: 'Chitra', ruler: 'Mars', deity: 'Vishwakarma', nature: 'Creative, beautiful, artistic', element: 'Earth' },
  { name: 'Swati', ruler: 'Rahu', deity: 'Vayu', nature: 'Independent, flexible, scattered', element: 'Air' },
  { name: 'Vishakha', ruler: 'Jupiter', deity: 'Indra-Agni', nature: 'Goal-oriented, determined, dual', element: 'Air' },
  { name: 'Anuradha', ruler: 'Saturn', deity: 'Mitra', nature: 'Devotional, friendly, successful', element: 'Air' },
  { name: 'Jyeshtha', ruler: 'Mercury', deity: 'Indra', nature: 'Protective, senior, intense', element: 'Air' },
  { name: 'Mula', ruler: 'Ketu', deity: 'Nirriti', nature: 'Destructive-transformative, roots', element: 'Fire' },
  { name: 'Purva Ashadha', ruler: 'Venus', deity: 'Apas', nature: 'Invincible, purifying, truthful', element: 'Fire' },
  { name: 'Uttara Ashadha', ruler: 'Sun', deity: 'Vishvedevas', nature: 'Universal, victorious, righteous', element: 'Fire' },
  { name: 'Shravana', ruler: 'Moon', deity: 'Vishnu', nature: 'Listening, learning, connecting', element: 'Earth' },
  { name: 'Dhanishtha', ruler: 'Mars', deity: 'Vasus', nature: 'Wealthy, rhythmic, ambitious', element: 'Earth' },
  { name: 'Shatabhisha', ruler: 'Rahu', deity: 'Varuna', nature: 'Healing, secretive, independent', element: 'Air' },
  { name: 'Purva Bhadrapada', ruler: 'Jupiter', deity: 'Aja Ekapad', nature: 'Fiery, transformative, intense', element: 'Air' },
  { name: 'Uttara Bhadrapada', ruler: 'Saturn', deity: 'Ahir Budhnya', nature: 'Deep, wise, controlled', element: 'Air' },
  { name: 'Revati', ruler: 'Mercury', deity: 'Pushan', nature: 'Nurturing, safe travel, completion', element: 'Water' },
];

const ashtakootFactors = [
  { name: 'Varna', points: 1, meaning: 'Spiritual compatibility and ego alignment', desc: 'Compares the spiritual nature of both partners' },
  { name: 'Vashya', points: 2, meaning: 'Mutual attraction and control dynamics', desc: 'Determines magnetic pull and influence between partners' },
  { name: 'Tara', points: 3, meaning: 'Destiny and health compatibility', desc: 'Indicates long-term health and well-being together' },
  { name: 'Yoni', points: 4, meaning: 'Physical and intimate compatibility', desc: 'Measures sexual chemistry and physical attraction' },
  { name: 'Graha Maitri', points: 5, meaning: 'Mental and intellectual harmony', desc: 'Friendship between Moon sign lords - crucial for understanding' },
  { name: 'Gana', points: 6, meaning: 'Temperament and nature matching', desc: 'Deva (divine), Manushya (human), or Rakshasa (demon) nature' },
  { name: 'Bhakoot', points: 7, meaning: 'Emotional compatibility and prosperity', desc: 'Indicates financial stability and emotional bond' },
  { name: 'Nadi', points: 8, meaning: 'Health of offspring and genetic compatibility', desc: 'Most important factor - same Nadi is a major dosha' },
];

export default function NakshatraCompatibility() {
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
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/40 via-rose-900/30 to-purple-900/40" />
          <div className="absolute inset-0">
            <div className="stars" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full text-pink-300 text-sm font-medium mb-6">
              Relationships • 14 min read
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Nakshatra Compatibility: Your Guide to Vedic Love Matching
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Beyond Sun signs lies a deeper system - the 27 Nakshatras that reveal
              true compatibility in relationships and marriage.
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
              In Vedic astrology, your Nakshatra (lunar mansion) is often more important than your
              Sun sign for understanding relationships. The Moon represents the mind and emotions -
              the very foundation of how we connect with others. Nakshatra compatibility has been
              used for centuries in Indian matchmaking, and its wisdom remains relevant for anyone
              seeking deeper relationship insights.
            </p>

            {/* What are Nakshatras */}
            <section className="my-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
                  🌙
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white m-0">
                    What Are Nakshatras?
                  </h2>
                  <p className="text-gray-500 m-0">The 27 Lunar Mansions</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 m-0">
                  The zodiac is divided into <strong>27 Nakshatras</strong>, each spanning 13°20&apos;
                  of the ecliptic. Your birth Nakshatra is determined by the Moon&apos;s position at
                  birth. Each Nakshatra has its own ruling deity, planetary lord, animal symbol,
                  and unique characteristics that profoundly influence personality and compatibility.
                </p>
              </div>

              <div className="overflow-x-auto">
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2 min-w-max md:min-w-0">
                  {nakshatras.slice(0, 9).map((n) => (
                    <div key={n.name} className="bg-white dark:bg-white/5 rounded-lg p-2 text-center border border-gray-100 dark:border-gray-800">
                      <div className="text-xs font-semibold text-gray-800 dark:text-white">{n.name}</div>
                      <div className="text-[10px] text-gray-500">{n.ruler}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2 min-w-max md:min-w-0 mt-2">
                  {nakshatras.slice(9, 18).map((n) => (
                    <div key={n.name} className="bg-white dark:bg-white/5 rounded-lg p-2 text-center border border-gray-100 dark:border-gray-800">
                      <div className="text-xs font-semibold text-gray-800 dark:text-white">{n.name}</div>
                      <div className="text-[10px] text-gray-500">{n.ruler}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2 min-w-max md:min-w-0 mt-2">
                  {nakshatras.slice(18, 27).map((n) => (
                    <div key={n.name} className="bg-white dark:bg-white/5 rounded-lg p-2 text-center border border-gray-100 dark:border-gray-800">
                      <div className="text-xs font-semibold text-gray-800 dark:text-white">{n.name}</div>
                      <div className="text-[10px] text-gray-500">{n.ruler}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Ashtakoot System */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                The Ashtakoot System: 8 Factors of Compatibility
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Traditional Vedic matchmaking uses the <strong>Ashtakoot</strong> (8 factors) system,
                also called <strong>Guna Milan</strong>. This analyzes 36 points (gunas) across 8
                categories based on both partners&apos; Nakshatras.
              </p>

              <div className="space-y-3 mb-6">
                {ashtakootFactors.map((factor) => (
                  <div
                    key={factor.name}
                    className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{factor.name}</h3>
                      <span className="text-sm font-bold text-pink-600 dark:text-pink-400">{factor.points} pts</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{factor.meaning}</p>
                    <p className="text-xs text-gray-500">{factor.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Score Interpretation:</h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">0-17</div>
                    <div className="text-gray-600 dark:text-gray-400">Not recommended</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">18-24</div>
                    <div className="text-gray-600 dark:text-gray-400">Average match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">25-32</div>
                    <div className="text-gray-600 dark:text-gray-400">Good match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-500">33-36</div>
                    <div className="text-gray-600 dark:text-gray-400">Excellent match</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Compatibility Patterns */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Natural Compatibility Patterns
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Beyond numerical scores, certain Nakshatra combinations naturally harmonize or challenge each other.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Naturally Compatible</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Same element Nakshatras (Fire-Fire, Earth-Earth)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Same Gana (Deva-Deva, Manushya-Manushya)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Complementary planetary rulers (Sun-Moon, Venus-Mars)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Nakshatras in trine (1st, 10th, 19th from each other)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">Challenging Combinations</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">!</span>
                      <span>Same Nadi (health concerns for offspring)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">!</span>
                      <span>Vedha (obstruction) Nakshatras that block each other</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">!</span>
                      <span>Enemy Yonis (natural animal enemies)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">!</span>
                      <span>Deva-Rakshasa Gana mismatch</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Beyond the Score */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Beyond the Numbers: What Really Matters
              </h2>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  While Nakshatra matching is valuable, experienced astrologers look at the complete picture:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <div>
                      <strong className="text-gray-800 dark:text-white">7th House Analysis:</strong>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">The house of marriage in both charts</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Venus Placement:</strong>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">The planet of love and relationships</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Mars Dosha:</strong>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">Manglik matching if applicable</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm flex-shrink-0">4</span>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Dasha Timing:</strong>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">Current planetary periods of both partners</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm flex-shrink-0">5</span>
                    <div>
                      <strong className="text-gray-800 dark:text-white">Navamsa Chart:</strong>
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">The D9 chart specifically for marriage</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border-l-4 border-purple-500">
                <p className="text-purple-800 dark:text-purple-200 text-sm m-0">
                  <strong>Important:</strong> A low compatibility score doesn&apos;t doom a relationship, and a
                  high score doesn&apos;t guarantee success. These tools offer guidance, not verdicts. Many
                  happy marriages exist with &quot;challenging&quot; scores, and difficult ones with &quot;perfect&quot; matches.
                  Free will and commitment matter immensely.
                </p>
              </div>
            </section>

            {/* Practical Tips */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Using Nakshatra Wisdom in Modern Relationships
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-3">🗣️</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Communication Style</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Understanding each other&apos;s Nakshatra can reveal natural communication
                    patterns and potential misunderstandings.
                  </p>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-3">❤️</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Love Languages</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Different Nakshatras express and receive love differently. Learn what your
                    partner&apos;s Nakshatra needs to feel loved.
                  </p>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Conflict Resolution</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Know your partner&apos;s Gana (temperament) and approach disagreements with
                    awareness of their natural response patterns.
                  </p>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="text-2xl mb-3">🎯</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Shared Goals</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nakshatra deities and natures can reveal aligned life purposes and where
                    you can support each other&apos;s growth.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="my-12 bg-gradient-to-r from-primary-600 to-cosmic-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">
                Check Your Nakshatra Compatibility
              </h2>
              <p className="text-white/80 mb-6">
                Discover your Nakshatra, explore compatibility with your partner, and get
                personalized insights about your relationship dynamics.
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
              >
                Get Free Compatibility Report
              </Link>
            </section>

            {/* Disclaimer */}
            <div className="text-sm text-gray-500 dark:text-gray-500 italic mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <strong>Note:</strong> Nakshatra compatibility is one lens among many for understanding
              relationships. It should complement - not replace - genuine connection, shared values,
              effective communication, and mutual respect. Use these insights as tools for growth,
              not as final judgments.
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
