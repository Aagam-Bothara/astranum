import type { Metadata } from 'next';
import Script from 'next/script';
import { generateBreadcrumbSchema, softwareApplicationSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Pricing Plans - Affordable Vedic Astrology & Numerology',
  description:
    'Choose from Free, Starter (Rs.99/mo), Pro (Rs.699/mo), or Max (Rs.1999/mo) plans. Get AI-powered kundli analysis, birth charts, numerology readings, and more. Start free today!',
  keywords: [
    'astrology pricing',
    'kundli subscription',
    'numerology plans',
    'affordable astrology',
    'horoscope subscription india',
    'vedic astrology cost',
    'free kundli online',
    'premium astrology',
  ],
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'AstraVaani Pricing - Plans Starting at Rs.99/month',
    description:
      'Affordable Vedic astrology and numerology plans. Free tier includes 2 questions. Premium plans unlock advanced features, validated AI responses, and unlimited history.',
  },
};

const pricingBreadcrumb = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Pricing', url: '/pricing' },
]);

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="pricing-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingBreadcrumb) }}
      />
      <Script
        id="software-app-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      {children}
    </>
  );
}
