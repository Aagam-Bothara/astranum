'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="text-2xl font-bold gradient-text mb-4 inline-block">
              AstraVaani
            </Link>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: January 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔒</span> Our Commitment to Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                At AstraVaani, we understand that your birth data and personal questions are deeply private.
                We are committed to protecting your information and being transparent about how we use it.
                This policy explains what data we collect, why, and how we keep it safe.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📋</span> Information We Collect
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Account Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Email address (for account access and notifications)</li>
                    <li>Encrypted password</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Profile Data</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Full name (for numerology calculations)</li>
                    <li>Date of birth (for chart computation)</li>
                    <li>Time of birth (optional, for precise chart)</li>
                    <li>Place of birth (for geographical coordinates)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Conversation Data</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Questions you ask</li>
                    <li>Responses generated for you</li>
                    <li>Computed chart data used in responses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Payment Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We use Razorpay for payment processing</li>
                    <li>We do NOT store your card details</li>
                    <li>We only store transaction IDs for subscription management</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎯</span> How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li><strong>Chart Computation:</strong> Your birth data is used to calculate your astrological chart and numerology numbers</li>
                <li><strong>Personalized Guidance:</strong> Your questions and chart data are sent to our AI to generate relevant responses</li>
                <li><strong>Account Management:</strong> Email is used for login, password reset, and important notifications</li>
                <li><strong>Service Improvement:</strong> Anonymized, aggregated data helps us improve our service</li>
                <li><strong>Subscription Management:</strong> To track your plan and usage limits</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🛡️</span> How We Protect Your Data
              </h2>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Encryption in Transit:</strong> All data is transmitted over HTTPS (TLS 1.3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Encryption at Rest:</strong> Sensitive data is encrypted in our database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Password Hashing:</strong> Passwords are hashed using bcrypt, never stored in plain text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>Secure Tokens:</strong> JWT tokens expire after 7 days and can be revoked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><strong>No Third-Party Sharing:</strong> We never sell or share your personal data with advertisers</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🤖</span> AI and Your Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                When you ask a question, your query and computed chart data are sent to Anthropic&apos;s Claude AI
                for generating responses. Here&apos;s what you should know:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li>Your conversations are not used to train the AI model</li>
                <li>Data is processed in real-time and not retained by Anthropic beyond the API call</li>
                <li>We send only the minimum data needed (chart data + your question)</li>
                <li>Personal identifiers (email, full name) are not sent to the AI</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⏳</span> Data Retention
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Conversation History:</strong> Based on your subscription tier (30 days to unlimited)</li>
                <li><strong>After Account Deletion:</strong> All personal data is deleted within 30 days</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📜</span> Your Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                <li><strong>Access:</strong> Request a copy of all data we have about you</li>
                <li><strong>Correction:</strong> Update or correct your profile information</li>
                <li><strong>Deletion:</strong> Request complete deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your conversation history</li>
                <li><strong>Objection:</strong> Opt out of non-essential data processing</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:privacy@astravaani.com" className="text-primary-600 hover:underline">
                  privacy@astravaani.com
                </a>
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🍪</span> Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We use minimal cookies for essential functionality only:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4 mt-2">
                <li><strong>Authentication:</strong> To keep you logged in</li>
                <li><strong>Preferences:</strong> To remember your settings (dark mode, language)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We do NOT use tracking cookies, advertising cookies, or third-party analytics.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔄</span> Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We may update this privacy policy from time to time. If we make significant changes,
                we will notify you via email or a prominent notice on our website before the changes
                take effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📧</span> Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-gray-600 dark:text-gray-400">
                  Email:{' '}
                  <a href="mailto:privacy@astravaani.com" className="text-primary-600 hover:underline">
                    privacy@astravaani.com
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
