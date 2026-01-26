'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
  return (
    <>
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="text-2xl font-bold gradient-text mb-4 inline-block">
              AstraVaani
            </Link>
            <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
            <p className="text-gray-500">Last updated: January 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💰</span> Our Refund Commitment
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We want you to be completely satisfied with AstraVaani. If you&apos;re not happy
                with your subscription, we offer a straightforward refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>✅</span> 7-Day Money-Back Guarantee
              </h2>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  If you&apos;re not satisfied with your paid subscription, you can request a
                  <strong> full refund within 7 days</strong> of your payment. No questions asked.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📋</span> Refund Eligibility
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <h3 className="font-semibold text-green-600 mb-2">Eligible for Refund</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                    <li>First-time subscription within 7 days of payment</li>
                    <li>Technical issues that prevent service usage</li>
                    <li>Accidental duplicate payments</li>
                    <li>Service significantly different from description</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <h3 className="font-semibold text-red-600 mb-2">Not Eligible for Refund</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                    <li>Requests made after 7 days of payment</li>
                    <li>Usage of a significant portion of monthly quota</li>
                    <li>Repeated refund requests (more than 2 in 6 months)</li>
                    <li>Account terminated for Terms of Service violations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔄</span> How to Request a Refund
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-400 ml-4">
                <li>
                  <strong>Email us</strong> at{' '}
                  <a href="mailto:support@astravaani.com" className="text-primary-600 hover:underline">
                    support@astravaani.com
                  </a>
                </li>
                <li>
                  <strong>Include</strong> your registered email address and reason for refund
                </li>
                <li>
                  <strong>We&apos;ll respond</strong> within 24-48 hours
                </li>
                <li>
                  <strong>Refunds are processed</strong> within 5-7 business days to your original payment method
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⏰</span> Refund Timeline
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-white/5">
                    <th className="text-left p-3 rounded-tl-lg">Payment Method</th>
                    <th className="text-left p-3 rounded-tr-lg">Refund Time</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400">
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-3">UPI</td>
                    <td className="p-3">1-3 business days</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-3">Debit/Credit Card</td>
                    <td className="p-3">5-7 business days</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-3">Net Banking</td>
                    <td className="p-3">5-7 business days</td>
                  </tr>
                  <tr>
                    <td className="p-3 rounded-bl-lg">Wallet</td>
                    <td className="p-3 rounded-br-lg">1-3 business days</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🚫</span> Cancellation vs Refund
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>Cancellation</strong> and <strong>Refund</strong> are different:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <h3 className="font-semibold mb-2">Cancellation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stops future billing. You keep access until the end of your current billing period.
                    No money is refunded.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <h3 className="font-semibold mb-2">Refund</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Money is returned to your payment method. Your subscription is immediately
                    downgraded to Free tier.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💬</span> Questions?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have any questions about our refund policy, please don&apos;t hesitate to contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-gray-600 dark:text-gray-400">
                  Email:{' '}
                  <a href="mailto:support@astravaani.com" className="text-primary-600 hover:underline">
                    support@astravaani.com
                  </a>
                </p>
              </div>
            </section>
          </div>

          {/* Back link */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
