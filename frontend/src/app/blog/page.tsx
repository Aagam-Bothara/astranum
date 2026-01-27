import type { Metadata } from 'next';
import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/seo';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Astrology & Numerology Blog - Insights, Guides & Predictions',
  description:
    'Explore our collection of Vedic astrology and numerology articles. Learn about zodiac signs, life path numbers, planetary transits, and get guidance for your cosmic journey.',
  keywords: [
    'astrology blog',
    'numerology articles',
    'vedic astrology guide',
    'zodiac predictions',
    'life path number meaning',
    'kundli reading tips',
    'planetary transits 2026',
    'rashifal blog',
  ],
  alternates: {
    canonical: '/blog',
  },
};

const blogPosts = [
  {
    slug: '2026-cosmic-forecast',
    title: '2026 Cosmic Forecast: What the Stars Hold for You',
    excerpt:
      'A comprehensive guide to the major planetary movements of 2026 and how they may influence your life path. Saturn, Jupiter, and Rahu-Ketu shifts explained.',
    category: 'Predictions',
    readTime: '8 min read',
    date: 'January 2026',
    featured: true,
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    slug: 'life-path-number-guide',
    title: 'The Complete Guide to Life Path Numbers',
    excerpt:
      'Discover your life path number and what it reveals about your personality, strengths, challenges, and life purpose. Calculate yours now.',
    category: 'Numerology',
    readTime: '12 min read',
    date: 'January 2026',
    featured: true,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    slug: 'understanding-your-kundli',
    title: 'Understanding Your Kundli: A Beginner\'s Guide',
    excerpt:
      'Learn to read your birth chart like a pro. We break down houses, planets, and aspects in simple terms anyone can understand.',
    category: 'Astrology',
    readTime: '15 min read',
    date: 'January 2026',
    featured: true,
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    slug: 'saturn-return-survival-guide',
    title: 'Saturn Return Survival Guide: Ages 27-30',
    excerpt:
      'Your Saturn Return is a pivotal life moment. Learn what to expect, how to prepare, and how to make the most of this transformative period.',
    category: 'Transits',
    readTime: '10 min read',
    date: 'January 2026',
    gradient: 'from-slate-600 to-slate-800',
  },
  {
    slug: 'nakshatra-compatibility',
    title: 'Nakshatra Compatibility: Finding Your Cosmic Match',
    excerpt:
      'Beyond sun signs: discover how your birth nakshatra influences relationships and compatibility in Vedic astrology.',
    category: 'Relationships',
    readTime: '11 min read',
    date: 'January 2026',
    gradient: 'from-rose-500 to-red-600',
  },
  {
    slug: 'mercury-retrograde-2026',
    title: 'Mercury Retrograde 2026: Dates & Survival Tips',
    excerpt:
      'All Mercury retrograde periods for 2026 with practical advice on communication, travel, and technology during these phases.',
    category: 'Transits',
    readTime: '6 min read',
    date: 'January 2026',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const breadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
]);

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((p) => p.featured);
  const regularPosts = blogPosts.filter((p) => !p.featured);

  return (
    <>
      <Script
        id="blog-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic-900/30 via-primary-900/20 to-transparent" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="stars opacity-50" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Cosmic Insights</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore the wisdom of Vedic astrology and numerology. Guides, predictions,
              and insights to illuminate your path.
            </p>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
              Featured Articles
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Gradient Header */}
                  <div className={`h-32 bg-gradient-to-br ${post.gradient} relative`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-black/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
              More Articles
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {regularPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-4 p-4 rounded-xl bg-white dark:bg-white/5 shadow hover:shadow-lg transition-all"
                >
                  {/* Mini Gradient */}
                  <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${post.gradient} flex-shrink-0`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                      {post.category}
                    </span>
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mt-1 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Explore Your Chart?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get personalized insights based on your unique birth details.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-full font-semibold hover:from-primary-500 hover:to-cosmic-500 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free - 2 Questions Included
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
