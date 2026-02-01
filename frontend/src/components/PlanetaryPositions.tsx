'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface PlanetPosition {
  sign: string;
  sign_hindi: string;
  degree: number;
  absolute_longitude: number;
  is_retrograde: boolean;
}

interface TransitData {
  date: string;
  planets: Record<string, PlanetPosition>;
}

interface PlanetInfo {
  name: string;
  name_hindi: string;
  symbol: string;
  color: string;
  description: string;
  orbital_period: string;
  current_position?: PlanetPosition;
}

const ZODIAC_SIGNS = [
  { name: 'Aries', hindi: 'Mesha', symbol: '♈', element: 'fire' },
  { name: 'Taurus', hindi: 'Vrishabha', symbol: '♉', element: 'earth' },
  { name: 'Gemini', hindi: 'Mithuna', symbol: '♊', element: 'air' },
  { name: 'Cancer', hindi: 'Karka', symbol: '♋', element: 'water' },
  { name: 'Leo', hindi: 'Simha', symbol: '♌', element: 'fire' },
  { name: 'Virgo', hindi: 'Kanya', symbol: '♍', element: 'earth' },
  { name: 'Libra', hindi: 'Tula', symbol: '♎', element: 'air' },
  { name: 'Scorpio', hindi: 'Vrishchika', symbol: '♏', element: 'water' },
  { name: 'Sagittarius', hindi: 'Dhanu', symbol: '♐', element: 'fire' },
  { name: 'Capricorn', hindi: 'Makara', symbol: '♑', element: 'earth' },
  { name: 'Aquarius', hindi: 'Kumbha', symbol: '♒', element: 'air' },
  { name: 'Pisces', hindi: 'Meena', symbol: '♓', element: 'water' },
];

const ELEMENT_COLORS = {
  fire: { bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30', text: 'text-red-400' },
  earth: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  air: { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  water: { bg: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
};

const PLANET_DATA: Record<string, { name: string; hindi: string; symbol: string; gradient: string; icon: string }> = {
  sun: { name: 'Sun', hindi: 'Surya', symbol: '☉', gradient: 'from-yellow-400 to-orange-500', icon: '🌞' },
  moon: { name: 'Moon', hindi: 'Chandra', symbol: '☽', gradient: 'from-slate-300 to-slate-400', icon: '🌙' },
  mercury: { name: 'Mercury', hindi: 'Budha', symbol: '☿', gradient: 'from-emerald-400 to-green-500', icon: '💚' },
  venus: { name: 'Venus', hindi: 'Shukra', symbol: '♀', gradient: 'from-pink-400 to-rose-500', icon: '💗' },
  mars: { name: 'Mars', hindi: 'Mangal', symbol: '♂', gradient: 'from-red-500 to-red-600', icon: '🔴' },
  jupiter: { name: 'Jupiter', hindi: 'Guru', symbol: '♃', gradient: 'from-amber-400 to-yellow-500', icon: '🟡' },
  saturn: { name: 'Saturn', hindi: 'Shani', symbol: '♄', gradient: 'from-blue-500 to-indigo-600', icon: '🔵' },
  rahu: { name: 'Rahu', hindi: 'Rahu', symbol: '☊', gradient: 'from-purple-500 to-violet-600', icon: '🟣' },
  ketu: { name: 'Ketu', hindi: 'Ketu', symbol: '☋', gradient: 'from-orange-500 to-amber-600', icon: '🟠' },
};

const PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];

interface PlanetaryPositionsProps {
  showTitle?: boolean;
}

export default function PlanetaryPositions({ showTitle = true }: PlanetaryPositionsProps) {
  const [transits, setTransits] = useState<TransitData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [planetInfo, setPlanetInfo] = useState<PlanetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransits();
    const interval = setInterval(fetchTransits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTransits = async () => {
    try {
      const response = await api.getCurrentTransits();
      setTransits(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load planetary positions');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanetClick = async (planetName: string) => {
    if (selectedPlanet === planetName) {
      setSelectedPlanet(null);
      setPlanetInfo(null);
      return;
    }

    setSelectedPlanet(planetName);
    setInfoLoading(true);

    try {
      const response = await api.getPlanetInfo(planetName);
      setPlanetInfo(response.data);
    } catch (err) {
      console.error('Failed to load planet info:', err);
    } finally {
      setInfoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-200 dark:border-primary-800"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchTransits}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-cosmic-500 bg-clip-text text-transparent">
            Planetary Positions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {transits?.date ? new Date(transits.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }) : ''}
          </p>
        </div>
      )}

      {/* Planets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANET_ORDER.map((planetKey, index) => {
          const planet = PLANET_DATA[planetKey];
          const position = transits?.planets[planetKey];
          if (!planet || !position) return null;

          const signData = ZODIAC_SIGNS.find(s => s.name === position.sign);
          const elementColors = signData ? ELEMENT_COLORS[signData.element as keyof typeof ELEMENT_COLORS] : null;
          const isSelected = selectedPlanet === planetKey;

          return (
            <motion.button
              key={planetKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handlePlanetClick(planetKey)}
              className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/20'
                  : 'hover:shadow-lg'
              }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${elementColors?.bg || 'from-gray-500/10 to-gray-600/10'} opacity-50`}></div>
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  {/* Planet Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planet.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-xl font-bold">{planet.symbol}</span>
                  </div>

                  {/* Retrograde Badge */}
                  {position.is_retrograde && (
                    <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      Retrograde
                    </span>
                  )}
                </div>

                {/* Planet Name */}
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{planet.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{planet.hindi}</p>
                </div>

                {/* Sign Info */}
                <div className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r ${elementColors?.bg || 'from-gray-100 to-gray-200'} ${elementColors?.border || 'border-gray-300'} border`}>
                  <span className="text-2xl">{signData?.symbol}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{position.sign}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{position.degree.toFixed(1)}°</p>
                  </div>
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-cosmic-500"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Planet Details Modal */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              {/* Header Gradient */}
              <div className={`h-2 bg-gradient-to-r ${PLANET_DATA[selectedPlanet]?.gradient}`}></div>

              <div className="p-6">
                {infoLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin"></div>
                  </div>
                ) : planetInfo ? (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${PLANET_DATA[selectedPlanet]?.gradient} flex items-center justify-center shadow-lg`}>
                          <span className="text-white text-3xl font-bold">{planetInfo.symbol}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{planetInfo.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400">{planetInfo.name_hindi}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedPlanet(null); setPlanetInfo(null); }}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Current Position */}
                    {planetInfo.current_position && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 border border-primary-200 dark:border-primary-800">
                          <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">Current Sign</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {ZODIAC_SIGNS.find(s => s.name === planetInfo.current_position?.sign)?.symbol}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{planetInfo.current_position.sign}</p>
                              <p className="text-xs text-gray-500">{planetInfo.current_position.sign_hindi}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Position</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {planetInfo.current_position.degree.toFixed(2)}°
                          </p>
                          {planetInfo.current_position.is_retrograde && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-red-500">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                              Retrograde Motion
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{planetInfo.description}</p>
                    </div>

                    {/* Orbital Period */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>Orbital Period</span>
                      <span className="font-medium">{planetInfo.orbital_period}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500/50 to-orange-500/50"></div>
          <span>Fire Signs</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500/50 to-emerald-500/50"></div>
          <span>Earth Signs</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500/50 to-blue-500/50"></div>
          <span>Air Signs</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500/50 to-indigo-500/50"></div>
          <span>Water Signs</span>
        </div>
      </div>
    </div>
  );
}
