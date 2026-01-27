import type { Metadata } from 'next';
import Script from 'next/script';
import HomeClient from './HomeClient';
import { faqSchema, generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AstraVaani - Free Vedic Astrology & Numerology Guidance | AI Kundli Analysis',
  description:
    'Get free personalized Vedic astrology and numerology guidance. AI-powered kundli analysis, birth chart readings, life path numbers, and more. Start with 2 free questions - no credit card required.',
  keywords: [
    'free kundli',
    'vedic astrology free',
    'numerology calculator free',
    'online horoscope',
    'birth chart analysis',
    'life path number calculator',
    'AI astrology',
    'free janampatri',
    'rashifal today',
    'nakshatra calculator',
  ],
  alternates: {
    canonical: '/',
  },
};

const homeBreadcrumb = generateBreadcrumbSchema([{ name: 'Home', url: '/' }]);

export default function HomePage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumb) }}
      />
      <HomeClient />
    </>
  );
}
