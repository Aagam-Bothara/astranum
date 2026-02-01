'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface Yoga {
  name: string;
  name_sanskrit: string;
  yoga_type: string;
  planets_involved: string[];
  houses_involved: number[];
  is_benefic: boolean;
  strength: string;
  description: string;
  effects: string;
}

interface YogaData {
  profile_name: string;
  ascendant: string;
  yogas: Yoga[];
  total_yogas: number;
  benefic_yogas: number;
}

const YOGA_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  mahapurusha: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-700' },
  raja: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700' },
  dhana: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700' },
};

const YOGA_TYPE_ICONS: Record<string, string> = {
  mahapurusha: '👑',
  raja: '🏛️',
  dhana: '💰',
};

const STRENGTH_BADGES: Record<string, { color: string; label: string }> = {
  strong: { color: 'bg-green-500', label: 'Strong' },
  moderate: { color: 'bg-yellow-500', label: 'Moderate' },
  weak: { color: 'bg-gray-400', label: 'Weak' },
};

export function YogasDisplay() {
  const [data, setData] = useState<YogaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYoga, setSelectedYoga] = useState<Yoga | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchYogas = async () => {
      try {
        const response = await api.getYogas();
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load Yoga data');
      } finally {
        setLoading(false);
      }
    };
    fetchYogas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredYogas = filter === 'all'
    ? data.yogas
    : data.yogas.filter(y => y.yoga_type === filter);

  const yogaTypes = Array.from(new Set(data.yogas.map(y => y.yoga_type)));

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Yoga Combinations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ascendant: <span className="font-medium">{data.ascendant}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {data.total_yogas}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.benefic_yogas} benefic
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {yogaTypes.map(type => {
            const count = data.yogas.filter(y => y.yoga_type === type).length;
            const colors = YOGA_TYPE_COLORS[type] || YOGA_TYPE_COLORS.raja;
            return (
              <div
                key={type}
                className={`${colors.bg} ${colors.border} border rounded-lg p-3 text-center`}
              >
                <div className="text-2xl">{YOGA_TYPE_ICONS[type] || '✨'}</div>
                <div className={`font-semibold ${colors.text}`}>{count}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{type}</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Yogas ({data.total_yogas})
        </button>
        {yogaTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap capitalize ${
              filter === type
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {YOGA_TYPE_ICONS[type] || '✨'} {type} ({data.yogas.filter(y => y.yoga_type === type).length})
          </button>
        ))}
      </div>

      {/* Yoga Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredYogas.map((yoga, index) => {
            const colors = YOGA_TYPE_COLORS[yoga.yoga_type] || YOGA_TYPE_COLORS.raja;
            const strength = STRENGTH_BADGES[yoga.strength] || STRENGTH_BADGES.moderate;

            return (
              <motion.div
                key={yoga.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedYoga(yoga)}
                className={`${colors.bg} ${colors.border} border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{YOGA_TYPE_ICONS[yoga.yoga_type] || '✨'}</div>
                    <div>
                      <h4 className={`font-semibold ${colors.text}`}>{yoga.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {yoga.name_sanskrit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {yoga.is_benefic && (
                      <span className="text-green-500 text-lg" title="Benefic">✓</span>
                    )}
                    <span className={`${strength.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                      {strength.label}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                  {yoga.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {yoga.planets_involved.map(planet => (
                    <span
                      key={planet}
                      className="text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400"
                    >
                      {planet}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredYogas.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No yogas found for this filter.
        </div>
      )}

      {/* Yoga Detail Modal */}
      <AnimatePresence>
        {selectedYoga && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedYoga(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{YOGA_TYPE_ICONS[selectedYoga.yoga_type] || '✨'}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedYoga.name}
                    </h3>
                    <p className="text-sm text-gray-500 italic">{selectedYoga.name_sanskrit}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedYoga(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Formation</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedYoga.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Effects</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedYoga.effects}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Planets</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedYoga.planets_involved.map(planet => (
                        <span key={planet} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-sm">
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedYoga.houses_involved.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Houses</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedYoga.houses_involved.map(house => (
                          <span key={house} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm">
                            {house}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <span className={`${STRENGTH_BADGES[selectedYoga.strength]?.color || 'bg-gray-400'} text-white px-3 py-1 rounded-full text-sm`}>
                    {selectedYoga.strength} strength
                  </span>
                  {selectedYoga.is_benefic && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                      Benefic
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
