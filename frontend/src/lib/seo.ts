/**
 * SEO Configuration for AstraVaani
 * Centralized metadata management for optimal search engine optimization
 */

import type { Metadata } from 'next';

const SITE_NAME = 'AstraVaani';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astravaani.com';
const SITE_DESCRIPTION = 'Discover personalized guidance through computed Vedic astrology and numerology patterns. Get accurate kundli analysis, birth chart readings, and life path insights powered by AI. No predictions - just mathematical patterns.';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AstraVaani - Vedic Astrology & Numerology Guidance | AI-Powered Kundli Analysis',
    template: '%s | AstraVaani',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Primary keywords
    'vedic astrology',
    'numerology',
    'kundli',
    'birth chart',
    'horoscope',
    // Long-tail keywords
    'free kundli analysis',
    'vedic astrology online',
    'numerology calculator',
    'life path number',
    'AI astrology',
    'online janampatri',
    'rashi calculator',
    'nakshatra finder',
    // Hindi/Indian keywords
    'jyotish',
    'rashifal',
    'kundali milan',
    'janm kundli',
    // Feature keywords
    'birth time astrology',
    'personalized horoscope',
    'astrology guidance',
    'numerology reading',
  ],
  authors: [{ name: 'AstraVaani' }],
  creator: 'AstraVaani',
  publisher: 'AstraVaani',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'AstraVaani - Vedic Astrology & Numerology Guidance',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AstraVaani - Vedic Astrology & Numerology Guidance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstraVaani - Vedic Astrology & Numerology Guidance',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@astravaani',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-IN': SITE_URL,
      'en-US': SITE_URL,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
  classification: 'Astrology & Numerology',
};

// Page-specific metadata generators
export function generatePageMetadata(
  title: string,
  description: string,
  path: string = '',
  additionalKeywords: string[] = []
): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords: [...(defaultMetadata.keywords as string[]), ...additionalKeywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
    },
  };
}

// Structured data for Organization
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AstraVaani',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  sameAs: [
    // Add social media links when available
    // 'https://twitter.com/astravaani',
    // 'https://facebook.com/astravaani',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
};

// Structured data for WebApplication
export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AstraVaani',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free tier with 2 questions',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
};

// Structured data for SoftwareApplication (for app stores)
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AstraVaani',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'INR',
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '99',
      priceCurrency: 'INR',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '699',
      priceCurrency: 'INR',
    },
    {
      '@type': 'Offer',
      name: 'Max',
      price: '1999',
      priceCurrency: 'INR',
    },
  ],
};

// FAQ Schema for common questions
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AstraVaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AstraVaani is an AI-powered Vedic astrology and numerology guidance platform that provides personalized insights based on your birth chart and numerological calculations. We use mathematical patterns and astronomical data - not predictions.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is AstraVaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AstraVaani uses Swiss Ephemeris for precise astronomical calculations and validated AI responses. Every data point in your chart is mathematically computed, not guessed. Our AI responses are validated to ensure they only reference your actual chart data.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is AstraVaani free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! AstraVaani offers a free tier with 2 questions to get started. Paid plans start at just Rs.99/month for more features and questions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between astrology and numerology?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Astrology analyzes planetary positions at your birth time using astronomical calculations. Numerology derives insights from numbers in your name and birth date. AstraVaani offers both, and Pro users can combine them for deeper insights.',
      },
    },
  ],
};

// Breadcrumb schema generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
