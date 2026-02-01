'use client';

import { useState, useEffect, useCallback } from 'react';
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
  fire: { bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
  earth: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/20' },
  air: { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  water: { bg: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
};

const PLANET_DATA: Record<string, { name: string; hindi: string; symbol: string; gradient: string; glowColor: string }> = {
  sun: { name: 'Sun', hindi: 'Surya', symbol: '☉', gradient: 'from-yellow-400 to-orange-500', glowColor: 'rgba(251, 191, 36, 0.4)' },
  moon: { name: 'Moon', hindi: 'Chandra', symbol: '☽', gradient: 'from-slate-300 to-slate-400', glowColor: 'rgba(148, 163, 184, 0.4)' },
  mercury: { name: 'Mercury', hindi: 'Budha', symbol: '☿', gradient: 'from-emerald-400 to-green-500', glowColor: 'rgba(52, 211, 153, 0.4)' },
  venus: { name: 'Venus', hindi: 'Shukra', symbol: '♀', gradient: 'from-pink-400 to-rose-500', glowColor: 'rgba(244, 114, 182, 0.4)' },
  mars: { name: 'Mars', hindi: 'Mangal', symbol: '♂', gradient: 'from-red-500 to-red-600', glowColor: 'rgba(239, 68, 68, 0.4)' },
  jupiter: { name: 'Jupiter', hindi: 'Guru', symbol: '♃', gradient: 'from-amber-400 to-yellow-500', glowColor: 'rgba(251, 191, 36, 0.4)' },
  saturn: { name: 'Saturn', hindi: 'Shani', symbol: '♄', gradient: 'from-blue-500 to-indigo-600', glowColor: 'rgba(99, 102, 241, 0.4)' },
  rahu: { name: 'Rahu', hindi: 'Rahu', symbol: '☊', gradient: 'from-purple-500 to-violet-600', glowColor: 'rgba(139, 92, 246, 0.4)' },
  ketu: { name: 'Ketu', hindi: 'Ketu', symbol: '☋', gradient: 'from-orange-500 to-amber-600', glowColor: 'rgba(249, 115, 22, 0.4)' },
};

const PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTransits = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const response = await api.getCurrentTransits();
      setTransits(response.data);
      setError(null);
      setLastUpdated(new Date());
      setRefreshCountdown(REFRESH_INTERVAL / 1000);
    } catch (err) {
      setError('Failed to load planetary positions');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransits();
    const interval = setInterval(() => fetchTransits(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTransits]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => (prev > 0 ? prev - 1 : REFRESH_INTERVAL / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cosmic-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-500 animate-pulse">Loading cosmic data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
        >
          <span className="text-2xl">⚠️</span>
        </motion.div>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchTransits()}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/30 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, '-20%'],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {showTitle && (
        <div className="text-center relative z-10">
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-cosmic-500 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Planetary Positions
          </motion.h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {transits?.date ? new Date(transits.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }) : ''}
          </p>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {isRefreshing ? (
                <>
                  <motion.div
                    className="w-3 h-3 border border-primary-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Next update in {formatCountdown(refreshCountdown)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Planets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
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
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePlanetClick(planetKey)}
              className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-primary-500 shadow-xl shadow-primary-500/30'
                  : 'hover:shadow-xl'
              } ${elementColors?.glow || ''}`}
              style={{
                boxShadow: isSelected ? `0 0 30px ${planet.glowColor}` : undefined,
              }}
            >
              {/* Animated background gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${elementColors?.bg || 'from-gray-500/10 to-gray-600/10'}`}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  {/* Animated Planet Icon */}
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planet.gradient} flex items-center justify-center shadow-lg`}
                    animate={{
                      boxShadow: [
                        `0 4px 15px ${planet.glowColor}`,
                        `0 8px 25px ${planet.glowColor}`,
                        `0 4px 15px ${planet.glowColor}`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                  >
                    <span className="text-white text-xl font-bold">{planet.symbol}</span>
                  </motion.div>

                  {/* Retrograde Badge */}
                  {position.is_retrograde && (
                    <motion.span
                      className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold rounded-full flex items-center gap-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <motion.span
                        className="w-1.5 h-1.5 bg-red-500 rounded-full"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Retrograde
                    </motion.span>
                  )}
                </div>

                {/* Planet Name */}
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{planet.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{planet.hindi}</p>
                </div>

                {/* Sign Info with animation */}
                <motion.div
                  className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r ${elementColors?.bg || 'from-gray-100 to-gray-200'} ${elementColors?.border || 'border-gray-300'} border`}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    {signData?.symbol}
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{position.sign}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{position.degree.toFixed(2)}°</p>
                      {/* Degree indicator line */}
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${planet.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(position.degree / 30) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-cosmic-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                />
              )}

              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${planet.glowColor} 0%, transparent 70%)` }}
                whileHover={{ opacity: 0.3 }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Planet Details Modal */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mt-6 relative z-10"
          >
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl">
              {/* Animated Header Gradient */}
              <motion.div
                className={`h-2 bg-gradient-to-r ${PLANET_DATA[selectedPlanet]?.gradient}`}
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 100%' }}
              />

              <div className="p-6">
                {infoLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      className="w-10 h-10 rounded-full border-3 border-primary-200 border-t-primary-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                ) : planetInfo ? (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${PLANET_DATA[selectedPlanet]?.gradient} flex items-center justify-center shadow-lg`}
                          animate={{
                            boxShadow: [
                              `0 8px 30px ${PLANET_DATA[selectedPlanet]?.glowColor}`,
                              `0 12px 40px ${PLANET_DATA[selectedPlanet]?.glowColor}`,
                              `0 8px 30px ${PLANET_DATA[selectedPlanet]?.glowColor}`,
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span className="text-white text-3xl font-bold">{planetInfo.symbol}</span>
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{planetInfo.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400">{planetInfo.name_hindi}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => { setSelectedPlanet(null); setPlanetInfo(null); }}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Current Position */}
                    {planetInfo.current_position && (
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 border border-primary-200 dark:border-primary-800"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">Current Sign</p>
                          <div className="flex items-center gap-2">
                            <motion.span
                              className="text-2xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              {ZODIAC_SIGNS.find(s => s.name === planetInfo.current_position?.sign)?.symbol}
                            </motion.span>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{planetInfo.current_position.sign}</p>
                              <p className="text-xs text-gray-500">{planetInfo.current_position.sign_hindi}</p>
                            </div>
                          </div>
                        </motion.div>
                        <motion.div
                          className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Position</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {planetInfo.current_position.degree.toFixed(2)}°
                          </p>
                          {planetInfo.current_position.is_retrograde && (
                            <motion.span
                              className="inline-flex items-center gap-1 mt-1 text-xs text-red-500"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              Retrograde Motion
                            </motion.span>
                          )}
                        </motion.div>
                      </div>
                    )}

                    {/* Description */}
                    <motion.div
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{planetInfo.description}</p>
                    </motion.div>

                    {/* Orbital Period */}
                    <motion.div
                      className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span>Orbital Period</span>
                      <span className="font-medium">{planetInfo.orbital_period}</span>
                    </motion.div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { element: 'fire', label: 'Fire Signs', colors: 'from-red-500/50 to-orange-500/50' },
          { element: 'earth', label: 'Earth Signs', colors: 'from-green-500/50 to-emerald-500/50' },
          { element: 'air', label: 'Air Signs', colors: 'from-cyan-500/50 to-blue-500/50' },
          { element: 'water', label: 'Water Signs', colors: 'from-blue-500/50 to-indigo-500/50' },
        ].map((item, i) => (
          <motion.div
            key={item.element}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <motion.div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.colors}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
            <span>{item.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Last updated info */}
      {lastUpdated && (
        <motion.div
          className="text-center text-xs text-gray-400 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.div>
      )}
    </div>
  );
}
