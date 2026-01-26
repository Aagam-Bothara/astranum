'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Footer from '@/components/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type TierType = 'free' | 'starter' | 'pro' | 'max';

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [currentTier, setCurrentTier] = useState<TierType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in and fetch their current plan
    const token = localStorage.getItem('astravaani_token');
    if (token) {
      setIsLoggedIn(true);
      fetchCurrentSubscription();
    }
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.getCurrentSubscription();
      if (response.data?.tier) {
        setCurrentTier(response.data.tier as TierType);
      }
    } catch (err) {
      // If error, user might not have a subscription (free tier)
      setCurrentTier('free');
    }
  };

  const handleSubscribe = async (tier: 'starter' | 'pro' | 'max') => {
    setError('');
    setIsLoading(tier);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('astravaani_token');
      if (!token) {
        router.push('/login?redirect=/pricing');
        return;
      }

      // Create order
      const response = await api.upgradePlan(tier);
      const order = response.data;

      if (!order) {
        setError('Failed to create order. Please try again.');
        return;
      }

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Open Razorpay checkout
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'AstraVaani',
        description: `${tier} Plan Subscription`,
        order_id: order.order_id,
        handler: async function (response: any) {
          // Verify payment
          try {
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            router.push('/chat?upgraded=true');
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: '', // Will be filled by Razorpay
        },
        theme: {
          color: '#7C3AED',
        },
        modal: {
          ondismiss: function () {
            setIsLoading(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login?redirect=/pricing');
      } else {
        setError(err.response?.data?.detail || 'Failed to create order. Please try again.');
      }
    } finally {
      setIsLoading(null);
    }
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('astravaani_token')}`,
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Verification failed');
    }

    return response.json();
  };

  return (
    <main className="min-h-screen py-12 px-4">
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link
              href={isLoggedIn ? "/chat" : "/"}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <Link href={isLoggedIn ? "/chat" : "/"} className="text-2xl font-bold gradient-text">
              AstraVaani
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more guidance. All plans include our
            hallucination-free, validated responses.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free */}
          <div className={`rounded-2xl border ${currentTier === 'free' ? 'border-2 border-green-500' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-white/5 p-6 relative`}>
            {currentTier === 'free' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                Current Plan
              </div>
            )}
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">₹0</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <PricingFeature>2 questions (lifetime)</PricingFeature>
              <PricingFeature>Basic chart (Sun + Moon)</PricingFeature>
              <PricingFeature>Life Path number only</PricingFeature>
              <PricingFeature>Short responses</PricingFeature>
            </ul>
            {currentTier === 'free' ? (
              <div className="w-full py-3 text-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium text-sm">
                Your Current Plan
              </div>
            ) : (
              <Link
                href="/signup"
                className="block w-full py-3 text-center border border-gray-200 dark:border-white/20 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Starter */}
          <div className={`rounded-2xl border ${currentTier === 'starter' ? 'border-2 border-green-500' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-white/5 p-6 relative`}>
            {currentTier === 'starter' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                Current Plan
              </div>
            )}
            <h3 className="text-xl font-semibold mb-2">Starter</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">₹99</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <PricingFeature>15 questions/month</PricingFeature>
              <PricingFeature>3 profiles (self + family)</PricingFeature>
              <PricingFeature>Ascendant + Nakshatra</PricingFeature>
              <PricingFeature>Extended numerology</PricingFeature>
              <PricingFeature>Unlimited response length</PricingFeature>
              <PricingFeature>30-day history</PricingFeature>
            </ul>
            {currentTier === 'starter' ? (
              <div className="w-full py-3 text-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium text-sm">
                Your Current Plan
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe('starter')}
                disabled={isLoading === 'starter'}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading === 'starter' ? 'Processing...' : 'Subscribe'}
              </button>
            )}
          </div>

          {/* Pro */}
          <div className={`rounded-2xl border-2 ${currentTier === 'pro' ? 'border-green-500' : 'border-primary-500'} bg-gradient-to-b from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 p-6 relative`}>
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 ${currentTier === 'pro' ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-cosmic-500'} text-white text-xs font-medium rounded-full`}>
              {currentTier === 'pro' ? 'Current Plan' : 'Popular'}
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">₹699</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <PricingFeature>80 questions/month</PricingFeature>
              <PricingFeature>10 profiles</PricingFeature>
              <PricingFeature>Full house analysis</PricingFeature>
              <PricingFeature>All planets + transits</PricingFeature>
              <PricingFeature>Combined Astro + Numero</PricingFeature>
              <PricingFeature>Validated responses</PricingFeature>
              <PricingFeature>Weekly summary</PricingFeature>
            </ul>
            {currentTier === 'pro' ? (
              <div className="w-full py-3 text-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium text-sm">
                Your Current Plan
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={isLoading === 'pro'}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all disabled:opacity-50 text-sm"
              >
                {isLoading === 'pro' ? 'Processing...' : 'Subscribe'}
              </button>
            )}
          </div>

          {/* Max */}
          <div className={`rounded-2xl border-2 ${currentTier === 'max' ? 'border-green-500' : 'border-amber-500'} bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 relative`}>
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 ${currentTier === 'max' ? 'bg-green-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'} text-white text-xs font-medium rounded-full`}>
              {currentTier === 'max' ? 'Current Plan' : 'Premium'}
            </div>
            <h3 className="text-xl font-semibold mb-2">Max</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">₹1,999</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <PricingFeature>200 questions/month</PricingFeature>
              <PricingFeature>25 profiles</PricingFeature>
              <PricingFeature>Everything in Pro</PricingFeature>
              <PricingFeature>Highest-level validation</PricingFeature>
              <PricingFeature>Detailed explanations</PricingFeature>
              <PricingFeature>Priority support</PricingFeature>
              <PricingFeature>Unlimited history</PricingFeature>
            </ul>
            {currentTier === 'max' ? (
              <div className="w-full py-3 text-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium text-sm">
                Your Current Plan
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe('max')}
                disabled={isLoading === 'max'}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 text-sm"
              >
                {isLoading === 'max' ? 'Processing...' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FAQ
              question="What happens when I run out of questions?"
              answer="You can wait for your daily/monthly limit to reset, or upgrade your plan for more questions. We'll never lock you out mid-conversation."
            />
            <FAQ
              question="Can I change my plan anytime?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences."
            />
            <FAQ
              question="What's the difference between AI guidance and predictions?"
              answer="AstraVaani provides guidance based on computed patterns in your chart. We explain tendencies and possibilities - we never claim to predict specific future events."
            />
            <FAQ
              question="Is my birth data secure?"
              answer="Absolutely. Your data is encrypted and stored securely. We never share your personal information with third parties."
            />
          </div>
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <svg
        className="w-5 h-5 text-green-500 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-gray-600 dark:text-gray-400">{children}</span>
    </li>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
      <h3 className="font-semibold mb-2">{question}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{answer}</p>
    </div>
  );
}
