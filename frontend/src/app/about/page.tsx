'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Link href="/" className="text-2xl font-bold gradient-text mb-4 inline-block">
              AstraVaani
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Bringing ancient wisdom to modern guidance through AI that understands your unique cosmic blueprint.
            </p>
          </div>

          {/* Mission */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🎯</span> Our Mission
            </h2>
            <div className="bg-gradient-to-br from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 rounded-2xl p-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                AstraVaani was born from a simple frustration: most astrology apps give you generic
                sun-sign horoscopes that could apply to anyone. We wanted something different &mdash;
                guidance that actually uses your complete birth chart data, computed with precision,
                and delivered with the intelligence of modern AI.
              </p>
            </div>
          </section>

          {/* What Makes Us Different */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-3xl">✨</span> What Makes Us Different
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <DifferentiatorCard
                emoji="🔬"
                title="Hallucination-Free Responses"
                description="Unlike generic AI astrology, we don't make things up. Every insight is grounded in your actual computed chart data &mdash; planet positions, houses, nakshatras, and numerological calculations."
              />

              <DifferentiatorCard
                emoji="🔮"
                title="Dual Wisdom System"
                description="We combine Vedic Astrology with Pythagorean Numerology to give you a more complete picture. Choose astrology-only, numerology-only, or get the combined power of both."
              />

              <DifferentiatorCard
                emoji="✅"
                title="Validated Guidance"
                description="Our Pro and Max tiers use a two-step validation pipeline. The AI generates guidance, then a validator checks that every claim is supported by your chart data."
              />

              <DifferentiatorCard
                emoji="📊"
                title="Transparent Data Usage"
                description="We show you exactly which data points were used for each response. No black boxes &mdash; you can verify the reasoning behind every insight."
              />

              <DifferentiatorCard
                emoji="🌟"
                title="Full Chart Analysis"
                description="We don't just look at your sun sign. We analyze all 9 Vedic planets, 12 houses, 27 nakshatras, planetary aspects, and current transits."
              />

              <DifferentiatorCard
                emoji="🧠"
                title="Modern AI + Ancient Wisdom"
                description="Powered by Claude, one of the world's most capable AI models, trained to understand and apply traditional Vedic astrological principles accurately."
              />
            </div>
          </section>

          {/* How We're Different from Others */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-3xl">⚖️</span> AstraVaani vs. Other Platforms
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-white/5">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold text-primary-600">AstraVaani</th>
                    <th className="text-center p-4 font-semibold text-gray-500">Generic AI Astrology</th>
                    <th className="text-center p-4 font-semibold text-gray-500">Traditional Apps</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <ComparisonRow
                    feature="Uses actual birth chart"
                    astravaani={true}
                    genericAI={false}
                    traditional={true}
                  />
                  <ComparisonRow
                    feature="AI-powered conversations"
                    astravaani={true}
                    genericAI={true}
                    traditional={false}
                  />
                  <ComparisonRow
                    feature="Response validation"
                    astravaani={true}
                    genericAI={false}
                    traditional={false}
                  />
                  <ComparisonRow
                    feature="Shows data sources"
                    astravaani={true}
                    genericAI={false}
                    traditional={false}
                  />
                  <ComparisonRow
                    feature="Numerology + Astrology"
                    astravaani={true}
                    genericAI={false}
                    traditional={false}
                  />
                  <ComparisonRow
                    feature="No generic predictions"
                    astravaani={true}
                    genericAI={false}
                    traditional={true}
                  />
                  <ComparisonRow
                    feature="Vedic system accuracy"
                    astravaani={true}
                    genericAI={false}
                    traditional={true}
                  />
                </tbody>
              </table>
            </div>
          </section>

          {/* Our Approach */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-3xl">🛠️</span> Our Approach
            </h2>

            <div className="space-y-6">
              <ProcessStep
                number={1}
                title="Precise Computation"
                description="We calculate your birth chart using Swiss Ephemeris, the gold standard for astronomical calculations. Your planet positions are accurate to the arc-second."
              />
              <ProcessStep
                number={2}
                title="Comprehensive Analysis"
                description="Your chart data includes sun sign, moon sign, ascendant, all planetary positions, house placements, nakshatra details, and numerological numbers derived from your name and birth date."
              />
              <ProcessStep
                number={3}
                title="Grounded Generation"
                description="When you ask a question, our AI receives your complete chart data and is instructed to only reference actual computed values &mdash; never to invent placements or make things up."
              />
              <ProcessStep
                number={4}
                title="Validation Check"
                description="For Pro and Max users, a second AI pass validates that the response accurately reflects your chart data, catching any potential hallucinations before you see the answer."
              />
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-primary-100 to-cosmic-100 dark:from-primary-900/30 dark:to-cosmic-900/30 rounded-2xl p-12">
              <h2 className="text-2xl font-bold mb-4">Ready to Experience the Difference?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                Start with 2 free questions. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-3 border border-gray-200 dark:border-white/20 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DifferentiatorCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function ComparisonRow({ feature, astravaani, genericAI, traditional }: { feature: string; astravaani: boolean; genericAI: boolean; traditional: boolean }) {
  return (
    <tr className="border-b border-gray-200 dark:border-white/10">
      <td className="p-4">{feature}</td>
      <td className="text-center p-4">
        {astravaani ? (
          <span className="text-green-500 text-xl">✓</span>
        ) : (
          <span className="text-red-400 text-xl">✗</span>
        )}
      </td>
      <td className="text-center p-4">
        {genericAI ? (
          <span className="text-green-500 text-xl">✓</span>
        ) : (
          <span className="text-red-400 text-xl">✗</span>
        )}
      </td>
      <td className="text-center p-4">
        {traditional ? (
          <span className="text-green-500 text-xl">✓</span>
        ) : (
          <span className="text-red-400 text-xl">✗</span>
        )}
      </td>
    </tr>
  );
}

function ProcessStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-cosmic-500 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
