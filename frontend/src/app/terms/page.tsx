'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="text-2xl font-bold gradient-text mb-4 inline-block">
              AstraVaani
            </Link>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-gray-500">Last updated: January 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                By accessing or using AstraVaani, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                AstraVaani provides AI-powered guidance based on Vedic astrology and numerology.
                Our service computes birth charts from user-provided data and generates personalized
                insights using artificial intelligence.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">3. Important Disclaimers</h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">⚠️</span>
                    <span><strong>Not Professional Advice:</strong> AstraVaani is for entertainment and self-reflection purposes only. It does not replace professional medical, legal, financial, or psychological advice.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">⚠️</span>
                    <span><strong>No Guarantees:</strong> We do not guarantee any specific outcomes. Astrological and numerological guidance represents patterns and possibilities, not certainties.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">⚠️</span>
                    <span><strong>AI Limitations:</strong> While we strive for accuracy, AI-generated responses may occasionally contain errors. Always use your own judgment.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">4. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li>Provide accurate birth data for best results</li>
                <li>Keep your account credentials secure</li>
                <li>Use the service for personal, non-commercial purposes</li>
                <li>Do not attempt to reverse-engineer or exploit the service</li>
                <li>Do not share harmful, illegal, or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">5. Subscription and Payments</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li>Subscriptions are billed monthly in Indian Rupees (INR)</li>
                <li>Payments are processed securely through Razorpay</li>
                <li>Subscriptions auto-renew unless cancelled before the billing date</li>
                <li>You can cancel anytime; access continues until the end of the billing period</li>
                <li>Price changes will be communicated at least 30 days in advance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                All content, features, and functionality of AstraVaani (including but not limited to
                text, graphics, logos, and software) are owned by AstraVaani and protected by
                intellectual property laws. You may not copy, modify, or distribute our content
                without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">7. Account Termination</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms,
                engage in fraudulent activity, or abuse the service. You may also delete your
                account at any time through your profile settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To the maximum extent permitted by law, AstraVaani shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages resulting from
                your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">9. Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We may update these terms from time to time. Continued use of the service after
                changes constitutes acceptance of the new terms. We will notify users of significant
                changes via email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">10. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of India.
                Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">11. Contact</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@astravaani.com" className="text-primary-600 hover:underline">
                  legal@astravaani.com
                </a>
              </p>
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
