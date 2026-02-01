'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface BirthChartData {
  profile: {
    id: string;
    name: string;
    date_of_birth: string;
    time_of_birth: string | null;
    place_of_birth: string;
    has_birth_time: boolean;
  };
  astrology: {
    sun_sign: PlanetData;
    moon_sign: PlanetData & { nakshatra: string; nakshatra_pada: number };
    ascendant: PlanetData | null;
    planets: Record<string, PlanetData>;
    moon_nakshatra: string;
    houses: Record<string, any> | null;
    has_birth_time: boolean;
  };
  numerology: {
    life_path: number;
    destiny_number: number;
    soul_urge: number;
    personality: number;
    birth_day: number;
    maturity_number: number;
    personal_year: number;
    birthday_number: number;
    karmic_debt: number[] | null;
    current_pinnacle: number;
    current_challenge: number;
  };
  transits: {
    date: string;
    planets: Record<string, PlanetData>;
  };
}

interface PlanetData {
  sign: string;
  sign_hindi: string;
  degree: number;
  absolute_longitude: number;
  is_retrograde?: boolean;
}

const ZODIAC_SIGNS = [
  { name: 'Aries', hindi: 'Mesha', symbol: '♈' },
  { name: 'Taurus', hindi: 'Vrishabha', symbol: '♉' },
  { name: 'Gemini', hindi: 'Mithuna', symbol: '♊' },
  { name: 'Cancer', hindi: 'Karka', symbol: '♋' },
  { name: 'Leo', hindi: 'Simha', symbol: '♌' },
  { name: 'Virgo', hindi: 'Kanya', symbol: '♍' },
  { name: 'Libra', hindi: 'Tula', symbol: '♎' },
  { name: 'Scorpio', hindi: 'Vrishchika', symbol: '♏' },
  { name: 'Sagittarius', hindi: 'Dhanu', symbol: '♐' },
  { name: 'Capricorn', hindi: 'Makara', symbol: '♑' },
  { name: 'Aquarius', hindi: 'Kumbha', symbol: '♒' },
  { name: 'Pisces', hindi: 'Meena', symbol: '♓' },
];

export default function BirthChart() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'numerology' | 'transits'>('chart');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBirthChart();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchBirthChart = async () => {
    try {
      const response = await api.getBirthChart();
      setChartData(response.data);
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to load birth chart';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Login Required</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please login to view your birth chart.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-cosmic-500"
        >
          Login
        </Link>
      </div>
    );
  }

  if (error) {
    const isPaidRequired = error.includes('paid subscription') || error.includes('upgrade');

    if (isPaidRequired) {
      return (
        <div className="text-center p-8 bg-gradient-to-br from-cosmic-50 to-primary-50 dark:from-cosmic-900/20 dark:to-primary-900/20 rounded-xl shadow-lg border border-cosmic-200 dark:border-cosmic-800">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-cosmic-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Unlock Your Kundli</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            View your complete birth chart, Kundli, and detailed astrological analysis with a paid subscription.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-cosmic-500"
          >
            Upgrade Now
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center p-8 text-red-500">
        {error}
        <button
          onClick={fetchBirthChart}
          className="block mx-auto mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!chartData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Birth Chart - Kundli</h2>
        <p className="opacity-90">
          {chartData.profile.name} | Born {new Date(chartData.profile.date_of_birth).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {chartData.profile.time_of_birth && ` at ${chartData.profile.time_of_birth}`}
        </p>
        {chartData.profile.place_of_birth && (
          <p className="text-sm opacity-80">{chartData.profile.place_of_birth}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'chart', label: 'Kundli Chart' },
          { id: 'numerology', label: 'Numerology' },
          { id: 'transits', label: 'Current Transits' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'chart' && (
          <KundliChartView astrology={chartData.astrology} />
        )}
        {activeTab === 'numerology' && (
          <NumerologyView numerology={chartData.numerology} />
        )}
        {activeTab === 'transits' && (
          <TransitsView transits={chartData.transits} natal={chartData.astrology} />
        )}
      </div>
    </div>
  );
}

function KundliChartView({ astrology }: { astrology: BirthChartData['astrology'] }) {
  return (
    <div className="space-y-8">
      {/* North Indian Style Kundli */}
      <div className="flex justify-center">
        <NorthIndianKundli astrology={astrology} />
      </div>

      {/* Key Positions */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Sun */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Sun Sign (Rashi)</h4>
          <p className="text-lg font-bold">{astrology.sun_sign.sign}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {astrology.sun_sign.sign_hindi} | {astrology.sun_sign.degree.toFixed(2)}°
          </p>
        </div>

        {/* Moon */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Moon Sign (Chandra Rashi)</h4>
          <p className="text-lg font-bold">{astrology.moon_sign.sign}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {astrology.moon_sign.sign_hindi} | {astrology.moon_sign.degree.toFixed(2)}°
          </p>
          {astrology.moon_nakshatra && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Nakshatra: {astrology.moon_nakshatra}
            </p>
          )}
        </div>

        {/* Ascendant */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Ascendant (Lagna)</h4>
          {astrology.ascendant ? (
            <>
              <p className="text-lg font-bold">{astrology.ascendant.sign}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {astrology.ascendant.sign_hindi} | {astrology.ascendant.degree.toFixed(2)}°
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Birth time required</p>
          )}
        </div>
      </div>

      {/* All Planets */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Planetary Positions (Graha Sthiti)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Planet</th>
                <th className="px-4 py-2 text-left">Sign</th>
                <th className="px-4 py-2 text-left">Degree</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium">Sun (Surya)</td>
                <td className="px-4 py-2">{astrology.sun_sign.sign} ({astrology.sun_sign.sign_hindi})</td>
                <td className="px-4 py-2">{astrology.sun_sign.degree.toFixed(2)}°</td>
                <td className="px-4 py-2">-</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Moon (Chandra)</td>
                <td className="px-4 py-2">{astrology.moon_sign.sign} ({astrology.moon_sign.sign_hindi})</td>
                <td className="px-4 py-2">{astrology.moon_sign.degree.toFixed(2)}°</td>
                <td className="px-4 py-2">{astrology.moon_nakshatra}</td>
              </tr>
              {Object.entries(astrology.planets).map(([name, pos]) => (
                <tr key={name}>
                  <td className="px-4 py-2 font-medium capitalize">{name}</td>
                  <td className="px-4 py-2">{pos.sign} ({pos.sign_hindi})</td>
                  <td className="px-4 py-2">{pos.degree.toFixed(2)}°</td>
                  <td className="px-4 py-2">
                    {pos.is_retrograde && (
                      <span className="text-red-500 font-medium">Retrograde</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NorthIndianKundli({ astrology }: { astrology: BirthChartData['astrology'] }) {
  // North Indian style kundli layout (diamond pattern)
  // House positions: 1=Lagna, 2-12 go counterclockwise
  const housePositions = [
    { x: 150, y: 0 },    // House 1 (top)
    { x: 75, y: 37.5 },  // House 2
    { x: 0, y: 75 },     // House 3
    { x: 0, y: 150 },    // House 4
    { x: 75, y: 187.5 }, // House 5
    { x: 150, y: 225 },  // House 6 (bottom)
    { x: 225, y: 187.5 },// House 7
    { x: 300, y: 150 },  // House 8
    { x: 300, y: 75 },   // House 9
    { x: 225, y: 37.5 }, // House 10
    { x: 150, y: 0 },    // House 11
    { x: 75, y: 37.5 },  // House 12
  ];

  // Map planets to houses based on sign
  const getPlanetsInSign = (signName: string) => {
    const planets: string[] = [];
    if (astrology.sun_sign.sign === signName) planets.push('Su');
    if (astrology.moon_sign.sign === signName) planets.push('Mo');
    Object.entries(astrology.planets).forEach(([name, pos]) => {
      if (pos.sign === signName) {
        const abbr = name.slice(0, 2).charAt(0).toUpperCase() + name.slice(1, 2);
        planets.push(pos.is_retrograde ? `${abbr}(R)` : abbr);
      }
    });
    return planets;
  };

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-md">
      {/* Outer square */}
      <rect x="0" y="0" width="300" height="300" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 dark:text-gray-600" />

      {/* Diamond lines */}
      <line x1="150" y1="0" x2="0" y2="150" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
      <line x1="150" y1="0" x2="300" y2="150" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
      <line x1="0" y1="150" x2="150" y2="300" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
      <line x1="300" y1="150" x2="150" y2="300" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />

      {/* Inner diamond */}
      <line x1="75" y1="75" x2="225" y2="75" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
      <line x1="225" y1="75" x2="225" y2="225" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
      <line x1="225" y1="225" x2="75" y2="225" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
      <line x1="75" y1="225" x2="75" y2="75" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />

      {/* House 1 (Lagna) - Top center triangle */}
      <text x="150" y="50" textAnchor="middle" className="fill-gray-700 dark:fill-gray-300 text-xs">
        {astrology.ascendant ? (
          <>
            <tspan x="150" dy="0" className="font-bold">{ZODIAC_SIGNS.find(s => s.name === astrology.ascendant?.sign)?.symbol}</tspan>
            <tspan x="150" dy="12" className="text-[8px]">
              {getPlanetsInSign(astrology.ascendant.sign).join(' ')}
            </tspan>
          </>
        ) : 'As'}
      </text>

      {/* Sign labels in each house */}
      {ZODIAC_SIGNS.map((sign, index) => {
        const planets = getPlanetsInSign(sign.name);
        // Position text in each house section
        const positions = [
          { x: 150, y: 45 },   // 1
          { x: 55, y: 90 },    // 2
          { x: 40, y: 150 },   // 3
          { x: 55, y: 210 },   // 4
          { x: 150, y: 255 },  // 5
          { x: 245, y: 210 },  // 6
          { x: 260, y: 150 },  // 7
          { x: 245, y: 90 },   // 8
          { x: 150, y: 125 },  // 9 (center top)
          { x: 110, y: 150 },  // 10 (center left)
          { x: 150, y: 175 },  // 11 (center bottom)
          { x: 190, y: 150 },  // 12 (center right)
        ];

        const pos = positions[index];
        if (!pos) return null;

        return (
          <g key={sign.name}>
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              className="fill-gray-500 dark:fill-gray-400"
              fontSize="10"
            >
              {sign.symbol}
            </text>
            {planets.length > 0 && (
              <text
                x={pos.x}
                y={pos.y + 12}
                textAnchor="middle"
                className="fill-primary-600 dark:fill-primary-400 font-medium"
                fontSize="8"
              >
                {planets.join(' ')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function NumerologyView({ numerology }: { numerology: BirthChartData['numerology'] }) {
  const coreNumbers = [
    { label: 'Life Path', value: numerology.life_path, description: 'Your life purpose and journey' },
    { label: 'Destiny', value: numerology.destiny_number, description: 'Your talents and potential' },
    { label: 'Soul Urge', value: numerology.soul_urge, description: 'Your inner motivation' },
    { label: 'Personality', value: numerology.personality, description: 'How others see you' },
    { label: 'Birthday', value: numerology.birthday_number, description: 'Special talents' },
    { label: 'Maturity', value: numerology.maturity_number, description: 'Goals for later life' },
  ];

  return (
    <div className="space-y-6">
      {/* Core Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {coreNumbers.map((num) => (
          <motion.div
            key={num.label}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-gradient-to-br from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
          >
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {num.value}
            </div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{num.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{num.description}</div>
          </motion.div>
        ))}
      </div>

      {/* Personal Year */}
      <div className="p-6 bg-cosmic-50 dark:bg-cosmic-900/20 rounded-xl border border-cosmic-200 dark:border-cosmic-800">
        <h4 className="font-semibold text-lg mb-2">Personal Year 2026</h4>
        <div className="text-4xl font-bold text-cosmic-600 dark:text-cosmic-400 mb-2">
          {numerology.personal_year}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This year's theme and energy influence on your life
        </p>
      </div>

      {/* Current Cycle */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Current Pinnacle</h4>
          <div className="text-2xl font-bold text-green-600">{numerology.current_pinnacle}</div>
          <p className="text-xs text-gray-500 mt-1">Peak experiences in this life phase</p>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Current Challenge</h4>
          <div className="text-2xl font-bold text-orange-600">{numerology.current_challenge}</div>
          <p className="text-xs text-gray-500 mt-1">Lessons to learn in this period</p>
        </div>
      </div>

      {/* Karmic Debt */}
      {numerology.karmic_debt && numerology.karmic_debt.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Karmic Debt Numbers</h4>
          <div className="flex gap-3">
            {numerology.karmic_debt.map((num) => (
              <span
                key={num}
                className="px-3 py-1 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-full font-bold"
              >
                {num}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            These numbers indicate lessons from past lives that need attention
          </p>
        </div>
      )}
    </div>
  );
}

function TransitsView({ transits, natal }: { transits: BirthChartData['transits']; natal: BirthChartData['astrology'] }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Current planetary positions as of {new Date(transits.date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Planet</th>
              <th className="px-4 py-2 text-left">Transit Position</th>
              <th className="px-4 py-2 text-left">Natal Position</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(transits.planets).map(([name, transitPos]) => {
              const natalPos = name === 'sun' ? natal.sun_sign :
                              name === 'moon' ? natal.moon_sign :
                              natal.planets[name];

              const isSameSign = natalPos && transitPos.sign === natalPos.sign;

              return (
                <tr key={name} className={isSameSign ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                  <td className="px-4 py-2 font-medium capitalize">{name}</td>
                  <td className="px-4 py-2">
                    {transitPos.sign} ({transitPos.sign_hindi}) - {transitPos.degree.toFixed(1)}°
                  </td>
                  <td className="px-4 py-2">
                    {natalPos ? `${natalPos.sign} (${natalPos.sign_hindi}) - ${natalPos.degree.toFixed(1)}°` : '-'}
                  </td>
                  <td className="px-4 py-2">
                    {transitPos.is_retrograde && (
                      <span className="text-red-500 font-medium mr-2">Retrograde</span>
                    )}
                    {isSameSign && (
                      <span className="text-green-600 dark:text-green-400 text-xs">Transit in natal sign</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <h4 className="font-semibold mb-2">What are Transits?</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Transits show where planets are currently moving through the zodiac and how they interact with your natal chart.
          When a transiting planet enters the same sign as your natal planet, it can activate that energy in your life.
        </p>
      </div>
    </div>
  );
}
