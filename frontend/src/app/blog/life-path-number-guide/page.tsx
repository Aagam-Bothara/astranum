import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Life Path Number Guide: Calculate Yours & Discover Your Destiny',
  description:
    'Learn how to calculate your Life Path Number and discover what it reveals about your personality, strengths, challenges, and life purpose according to Vedic numerology.',
  keywords: [
    'life path number',
    'life path number calculator',
    'numerology life path',
    'what is my life path number',
    'life path number meaning',
    'vedic numerology',
    'numerology calculator',
    'destiny number',
  ],
  alternates: {
    canonical: '/blog/life-path-number-guide',
  },
  openGraph: {
    title: 'Life Path Number Guide: Discover Your Numerology Destiny',
    description: 'Calculate your Life Path Number and unlock insights about your personality, purpose, and potential.',
    type: 'article',
    publishedTime: '2026-01-15T00:00:00Z',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Life Path Number Guide: Calculate Yours & Discover Your Destiny',
  description: 'A complete guide to calculating and understanding your Life Path Number in numerology.',
  author: { '@type': 'Organization', name: 'AstraVaani' },
  publisher: { '@type': 'Organization', name: 'AstraVaani' },
  datePublished: '2026-01-15',
  dateModified: '2026-01-27',
};

const breadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: 'Life Path Number Guide', url: '/blog/life-path-number-guide' },
]);

const lifePathData = [
  {
    number: 1,
    title: 'The Leader',
    traits: 'Independent, ambitious, pioneering',
    description: 'Natural born leaders who forge their own path. You thrive when innovating and taking charge.',
    strengths: 'Courage, determination, originality',
    challenges: 'Stubbornness, ego, impatience',
    color: 'from-red-500 to-orange-500',
  },
  {
    number: 2,
    title: 'The Peacemaker',
    traits: 'Diplomatic, intuitive, cooperative',
    description: 'Harmonizers who excel at bringing people together. Relationships and partnerships are your strength.',
    strengths: 'Empathy, patience, mediation',
    challenges: 'Over-sensitivity, indecision, dependency',
    color: 'from-orange-500 to-amber-500',
  },
  {
    number: 3,
    title: 'The Communicator',
    traits: 'Creative, expressive, social',
    description: 'Natural artists and communicators. Your gift is inspiring others through words and creativity.',
    strengths: 'Optimism, charm, artistic talent',
    challenges: 'Scattered energy, superficiality, mood swings',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    number: 4,
    title: 'The Builder',
    traits: 'Practical, disciplined, hardworking',
    description: 'Master organizers who create lasting foundations. You bring dreams into physical reality.',
    strengths: 'Reliability, focus, systematic approach',
    challenges: 'Rigidity, workaholism, resistance to change',
    color: 'from-green-600 to-emerald-500',
  },
  {
    number: 5,
    title: 'The Adventurer',
    traits: 'Free-spirited, versatile, curious',
    description: 'Freedom seekers who embrace change. Life is your playground for exploration and experience.',
    strengths: 'Adaptability, resourcefulness, enthusiasm',
    challenges: 'Restlessness, inconsistency, overindulgence',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    number: 6,
    title: 'The Nurturer',
    traits: 'Caring, responsible, domestic',
    description: 'Natural caregivers devoted to family and community. Your purpose involves service and love.',
    strengths: 'Compassion, loyalty, healing presence',
    challenges: 'Self-sacrifice, meddling, perfectionism',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    number: 7,
    title: 'The Seeker',
    traits: 'Analytical, spiritual, introspective',
    description: 'Truth seekers on a quest for deeper meaning. You bridge the scientific and mystical.',
    strengths: 'Wisdom, intuition, research ability',
    challenges: 'Isolation, skepticism, aloofness',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    number: 8,
    title: 'The Powerhouse',
    traits: 'Ambitious, authoritative, material',
    description: 'Masters of the material world. You&apos;re here to achieve success and share abundance.',
    strengths: 'Business acumen, leadership, manifestation',
    challenges: 'Workaholism, materialism, control issues',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    number: 9,
    title: 'The Humanitarian',
    traits: 'Compassionate, wise, selfless',
    description: 'Old souls here to serve humanity. Your path involves letting go and giving back.',
    strengths: 'Generosity, tolerance, artistic vision',
    challenges: 'Martyrdom, aloofness, scattered focus',
    color: 'from-purple-500 to-pink-500',
  },
];

const masterNumbers = [
  {
    number: 11,
    title: 'The Intuitive Master',
    description: 'Heightened intuition and spiritual insight. You&apos;re a channel for higher wisdom, often drawn to healing or teaching.',
  },
  {
    number: 22,
    title: 'The Master Builder',
    description: 'The most powerful number, combining vision with practical ability. You can turn the impossible into reality.',
  },
  {
    number: 33,
    title: 'The Master Teacher',
    description: 'Rare and powerful, embodying unconditional love and service. You uplift humanity through compassion.',
  },
];

export default function LifePathNumberGuide() {
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
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-red-900/40" />
          <div className="absolute inset-0">
            <div className="stars" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full text-amber-300 text-sm font-medium mb-6">
              Numerology • 10 min read
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Life Path Number Guide: Discover Your Numerology Destiny
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your Life Path Number is the most important number in your numerology chart.
              Learn how to calculate it and what it reveals about you.
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
              Your Life Path Number is like your cosmic DNA - a single digit that encodes your
              personality, talents, challenges, and life purpose. Derived from your birth date,
              it&apos;s the foundation of Vedic numerology and offers profound insights into who
              you are and why you&apos;re here.
            </p>

            {/* Calculator Section */}
            <section className="my-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                How to Calculate Your Life Path Number
              </h2>

              <div className="bg-white dark:bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  The calculation is simple: reduce your birth date to a single digit (or Master Number).
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Write your full birth date</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Example: March 15, 1990 → 03/15/1990</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Add each part separately</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Month: 0+3=3 | Day: 1+5=6 | Year: 1+9+9+0=19 → 1+9=10 → 1+0=1</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Add the results together</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">3 + 6 + 1 = 10 → 1 + 0 = <strong>Life Path 1</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-purple-800 dark:text-purple-200 text-sm m-0">
                  <strong>Master Numbers:</strong> If you get 11, 22, or 33 at any point, don&apos;t reduce further.
                  These are Master Numbers with special significance.
                </p>
              </div>
            </section>

            {/* Life Path Numbers */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
                The 9 Life Path Numbers Explained
              </h2>

              <div className="space-y-6">
                {lifePathData.map((path) => (
                  <div
                    key={path.number}
                    className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                  >
                    <div className={`bg-gradient-to-r ${path.color} p-4 flex items-center gap-4`}>
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold">
                        {path.number}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white m-0">{path.title}</h3>
                        <p className="text-white/80 text-sm m-0">{path.traits}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{path.description}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Strengths</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{path.strengths}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Challenges</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{path.challenges}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Master Numbers */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Master Numbers: 11, 22, 33
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Master Numbers carry amplified energy and greater potential - but also greater challenges.
                If you have a Master Number, you&apos;re here to achieve something significant.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {masterNumbers.map((master) => (
                  <div
                    key={master.number}
                    className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
                  >
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {master.number}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{master.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{master.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Practical Tips */}
            <section className="my-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Working With Your Life Path Number
              </h2>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
                <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Embrace your strengths:</strong> Your Life Path reveals your natural gifts. Lean into them rather than fighting against your nature.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Acknowledge challenges:</strong> The shadow side of your number shows growth areas. Awareness is the first step to transformation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Consider compatibility:</strong> Understanding others&apos; Life Path Numbers improves relationships and communication.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Combine with astrology:</strong> Your Life Path works alongside your birth chart for a complete picture.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* CTA */}
            <section className="my-12 bg-gradient-to-r from-primary-600 to-cosmic-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">
                Get Your Complete Numerology Reading
              </h2>
              <p className="text-white/80 mb-6">
                Your Life Path is just the beginning. Discover your Expression Number, Soul Urge,
                and how they work together with AstraVaani&apos;s AI analysis.
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
              >
                Calculate All Your Numbers Free
              </Link>
            </section>

            {/* Disclaimer */}
            <div className="text-sm text-gray-500 dark:text-gray-500 italic mt-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <strong>Note:</strong> Numerology is a tool for self-reflection and personal growth.
              Your Life Path Number offers guidance, not limitations. You have the power to shape
              your own destiny.
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
