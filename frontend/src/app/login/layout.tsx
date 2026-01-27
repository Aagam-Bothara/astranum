import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Access Your Astrology Dashboard',
  description:
    'Sign in to your AstraVaani account. Access your personalized Vedic astrology charts, numerology readings, and guidance history.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
