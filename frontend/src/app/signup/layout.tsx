import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Start Your Astrology Journey Free',
  description:
    'Create your free AstraVaani account. Get 2 free questions, personalized Vedic astrology charts, and numerology readings. No credit card required.',
  keywords: [
    'free astrology account',
    'sign up astrology',
    'create kundli account',
    'free horoscope registration',
  ],
  alternates: {
    canonical: '/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
