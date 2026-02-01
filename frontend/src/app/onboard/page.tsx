'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { DatePicker } from '@/components/DatePicker';
import { TimePicker } from '@/components/TimePicker';
import { PlacePicker } from '@/components/PlacePicker';
import { useAuth } from '@/contexts/AuthContext';

type GuidanceMode = 'astrology' | 'numerology' | 'both';
type Language = 'en' | 'hi' | 'hinglish';
type ResponseStyle = 'supportive' | 'balanced' | 'direct';

interface OnboardingData {
  mode: GuidanceMode;
  language: Language;
  responseStyle: ResponseStyle;
  fullName: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  placeOfBirth: string;
}

export default function OnboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, hasProfile, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [data, setData] = useState<Partial<OnboardingData>>({
    mode: 'both',
    language: 'hinglish',
    responseStyle: 'balanced',
  });

  // Check if user already has a profile - redirect to chat if they do
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && hasProfile) {
      // User already has a profile, skip to chat
      router.replace('/chat');
      return;
    }

    setCheckingProfile(false);
  }, [authLoading, isAuthenticated, hasProfile, router]);

  // Show loading while checking profile
  if (authLoading || checkingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  const handleModeSelect = (mode: GuidanceMode) => {
    setData({ ...data, mode });
    setStep(2);
  };

  const handleInputSubmit = (formData: Partial<OnboardingData>) => {
    setData({ ...data, ...formData });
    setStep(3);
  };

  const handleLanguageSelect = (language: Language) => {
    setData({ ...data, language });
    setStep(4);
  };

  const handleResponseStyleSelect = async (responseStyle: ResponseStyle) => {
    const finalData = { ...data, responseStyle };
    setData(finalData);
    setError('');
    setIsSubmitting(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('astravaani_token');
      if (!token) {
        // Store onboarding data and redirect to signup
        localStorage.setItem('astravaani_onboard_data', JSON.stringify(finalData));
        router.push('/signup');
        return;
      }

      // Ensure api client has the token loaded
      api.loadToken();

      // Create person profile via API
      await api.createPersonProfile({
        name: finalData.fullName!,
        date_of_birth: finalData.dateOfBirth!,
        time_of_birth: finalData.timeOfBirth || undefined,
        place_of_birth: finalData.placeOfBirth,
        relation_type: 'self',
        is_primary: true,
      });

      // Update user profile with preferences
      await api.updateProfile({
        response_style: responseStyle,
        language: finalData.language,
        guidanceMode: finalData.mode,
      });

      // Refresh auth state to update hasProfile
      await refreshUser();

      // Success - redirect to chat
      router.push('/chat');
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Something went wrong. Please try again.';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s <= step
                    ? 'bg-gradient-to-r from-primary-500 to-cosmic-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && <ModeSelection key="mode" onSelect={handleModeSelect} />}
          {step === 2 && (
            <InputCollection
              key="input"
              mode={data.mode!}
              onSubmit={handleInputSubmit}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <LanguageSelection
              key="language"
              onSelect={handleLanguageSelect}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <ResponseStyleSelection
              key="style"
              onSelect={handleResponseStyleSelect}
              onBack={() => setStep(3)}
              isSubmitting={isSubmitting}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ModeSelection({ onSelect }: { onSelect: (mode: GuidanceMode) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <h1 className="text-3xl font-bold mb-4">What kind of guidance are you looking for?</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Choose how you&apos;d like to explore your patterns
      </p>

      <div className="space-y-4">
        <button
          onClick={() => onSelect('astrology')}
          className="w-full p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cosmic-100 dark:bg-cosmic-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🌟</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Astrology</h3>
              <p className="text-sm text-gray-500">Kundli-based guidance</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('numerology')}
          className="w-full p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔢</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Numerology</h3>
              <p className="text-sm text-gray-500">Name + DOB based guidance</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('both')}
          className="w-full p-6 rounded-2xl bg-gradient-to-r from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 border-2 border-primary-500 text-left group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
            Recommended
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cosmic-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Both</h3>
              <p className="text-sm text-gray-500">Most clarity - combines both systems</p>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

function InputCollection({
  mode,
  onSubmit,
  onBack,
}: {
  mode: GuidanceMode;
  onSubmit: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
  });

  const needsPlace = mode === 'astrology' || mode === 'both';
  const needsTime = mode === 'astrology' || mode === 'both';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button
        onClick={onBack}
        className="mb-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Tell us about yourself</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This information is used to compute your chart
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            minLength={2}
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            placeholder="As commonly used"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={formData.dateOfBirth}
            onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
            placeholder="Select your date of birth"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Place of Birth <span className="text-red-500">*</span>
          </label>
          <PlacePicker
            value={formData.placeOfBirth}
            onChange={(place) => setFormData({ ...formData, placeOfBirth: place })}
            placeholder="Start typing a city name..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for accurate astrology calculations
          </p>
        </div>

        {needsTime && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Time of Birth <span className="text-gray-400 font-normal">(optional but recommended)</span>
            </label>
            <TimePicker
              value={formData.timeOfBirth}
              onChange={(time) => setFormData({ ...formData, timeOfBirth: time })}
              placeholder="Select your time of birth"
            />
            <p className="text-xs text-gray-500 mt-1">
              Needed for accurate ascendant and house calculations
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-xl font-semibold hover:from-primary-500 hover:to-cosmic-500 transition-all"
        >
          Continue
        </button>
      </form>
    </motion.div>
  );
}

function LanguageSelection({
  onSelect,
  onBack,
}: {
  onSelect: (language: Language) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button
        onClick={onBack}
        className="mb-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Choose your language</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">You can change this anytime in settings</p>

      <div className="space-y-4">
        <button
          onClick={() => onSelect('hinglish')}
          className="w-full p-6 rounded-2xl bg-gradient-to-r from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 border-2 border-primary-500 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Hinglish</h3>
              <p className="text-sm text-gray-500">Hindi-English mix (Roman script)</p>
            </div>
            <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">Default</span>
          </div>
        </button>

        <button
          onClick={() => onSelect('en')}
          className="w-full p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500 transition-all text-left"
        >
          <h3 className="font-semibold text-lg">English</h3>
          <p className="text-sm text-gray-500">Clear, simple English</p>
        </button>

        <button
          onClick={() => onSelect('hi')}
          className="w-full p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500 transition-all text-left"
        >
          <h3 className="font-semibold text-lg">हिंदी</h3>
          <p className="text-sm text-gray-500">Hindi (Devanagari script)</p>
        </button>
      </div>
    </motion.div>
  );
}

function ResponseStyleSelection({
  onSelect,
  onBack,
  isSubmitting,
}: {
  onSelect: (style: ResponseStyle) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <button
        onClick={onBack}
        disabled={isSubmitting}
        className="mb-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-3xl font-bold mb-4">How should I talk to you?</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Choose your preferred communication style</p>

      <div className="space-y-4">
        <button
          onClick={() => onSelect('supportive')}
          disabled={isSubmitting}
          className="w-full p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500 transition-all text-left disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <span className="text-2xl">💝</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Supportive</h3>
              <p className="text-sm text-gray-500">Warm, encouraging, emotionally supportive</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('balanced')}
          disabled={isSubmitting}
          className="w-full p-6 rounded-2xl bg-gradient-to-r from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 border-2 border-primary-500 text-left disabled:opacity-50 relative"
        >
          <div className="absolute top-2 right-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
            Recommended
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cosmic-500 flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Balanced</h3>
              <p className="text-sm text-gray-500">Mix of warmth and practical insights</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('direct')}
          disabled={isSubmitting}
          className="w-full p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500 transition-all text-left disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Direct</h3>
              <p className="text-sm text-gray-500">Blunt, precise, no sugar coating</p>
            </div>
          </div>
        </button>
      </div>

      {isSubmitting && (
        <div className="mt-6 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-2"></div>
          Creating your profile...
        </div>
      )}
    </motion.div>
  );
}
