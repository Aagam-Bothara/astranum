import type { Metadata } from 'next';
import { generateBreadcrumbSchema } from '@/lib/seo';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'About AstraVaani - AI-Powered Vedic Astrology Platform',
  description:
    'Learn about AstraVaani, the AI-powered Vedic astrology and numerology platform. We use Swiss Ephemeris for accurate calculations and validated AI for guidance - never predictions.',
  keywords: [
    'about astravaani',
    'vedic astrology ai',
    'astrology technology',
    'swiss ephemeris',
    'ai astrology platform',
    'indian astrology app',
  ],
  alternates: {
    canonical: '/about',
  },
};

const aboutBreadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
]);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="about-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutBreadcrumb) }}
      />
      {children}
    </>
  );
}
