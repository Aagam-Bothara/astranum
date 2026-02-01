'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface DashaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  level: number;
  sub_periods?: DashaPeriod[];
}

interface CurrentDasha {
  mahadasha: string;
  mahadasha_start: string;
  mahadasha_end: string;
  mahadasha_remaining_days: number;
  antardasha: string | null;
  antardasha_remaining_days: number | null;
}

interface DashaData {
  profile_name: string;
  moon_nakshatra: string;
  moon_sign: string;
  current_dasha: CurrentDasha;
  dasha_periods: DashaPeriod[];
}

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mars: '#FF6347',
  Mercury: '#90EE90',
  Jupiter: '#FFA500',
  Venus: '#FFB6C1',
  Saturn: '#4169E1',
  Rahu: '#483D8B',
  Ketu: '#8B4513',
};

const PLANET_ICONS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

export function DashaTimeline() {
  const [data, setData] = useState<DashaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);

  useEffect(() => {
    const fetchDasha = async () => {
      try {
        const response = await api.getDashaPeriods();
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load Dasha data');
      } finally {
        setLoading(false);
      }
    };
    fetchDasha();
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

  const { current_dasha, dasha_periods } = data;
  const remainingYears = Math.floor(current_dasha.mahadasha_remaining_days / 365);
  const remainingMonths = Math.floor((current_dasha.mahadasha_remaining_days % 365) / 30);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Current Dasha Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-4 md:p-6 border border-purple-200 dark:border-purple-800"
      >
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
          <span className="text-xl md:text-2xl">{PLANET_ICONS[current_dasha.mahadasha]}</span>
          Current Planetary Period
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Mahadasha */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg flex-shrink-0"
                style={{ backgroundColor: PLANET_COLORS[current_dasha.mahadasha] + '30' }}
              >
                {PLANET_ICONS[current_dasha.mahadasha]}
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Mahadasha</p>
                <p className="text-lg md:text-xl font-bold" style={{ color: PLANET_COLORS[current_dasha.mahadasha] }}>
                  {current_dasha.mahadasha}
                </p>
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2.5 md:p-3">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Remaining: <span className="font-semibold text-gray-900 dark:text-white">
                  {remainingYears}y {remainingMonths}m
                </span>
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                {new Date(current_dasha.mahadasha_start).toLocaleDateString()} - {new Date(current_dasha.mahadasha_end).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Antardasha */}
          {current_dasha.antardasha && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg flex-shrink-0"
                  style={{ backgroundColor: PLANET_COLORS[current_dasha.antardasha] + '30' }}
                >
                  {PLANET_ICONS[current_dasha.antardasha]}
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Antardasha</p>
                  <p className="text-lg md:text-xl font-bold" style={{ color: PLANET_COLORS[current_dasha.antardasha] }}>
                    {current_dasha.antardasha}
                  </p>
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2.5 md:p-3">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Remaining: <span className="font-semibold text-gray-900 dark:text-white">
                    {current_dasha.antardasha_remaining_days} days
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Dasha Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-lg">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
          Dasha Timeline
        </h3>

        <div className="space-y-2 md:space-y-3">
          {dasha_periods.map((period, index) => {
            const isCurrentPeriod = period.planet === current_dasha.mahadasha;
            const isPast = new Date(period.end_date) < new Date();
            const isExpanded = expandedPeriod === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setExpandedPeriod(isExpanded ? null : index)}
                  className={`w-full text-left rounded-xl p-3 md:p-4 transition-all active:scale-[0.99] ${
                    isCurrentPeriod
                      ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 ring-2 ring-purple-500'
                      : isPast
                      ? 'bg-gray-50 dark:bg-gray-700/50 opacity-60'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg md:text-xl flex-shrink-0"
                        style={{ backgroundColor: PLANET_COLORS[period.planet] + '30' }}
                      >
                        {PLANET_ICONS[period.planet]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white flex items-center gap-1.5 md:gap-2 flex-wrap">
                          <span className="truncate">{period.planet}</span>
                          {isCurrentPeriod && (
                            <span className="text-[10px] md:text-xs bg-purple-500 text-white px-1.5 md:px-2 py-0.5 rounded-full flex-shrink-0">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {new Date(period.start_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} - {new Date(period.end_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-xs md:text-sm text-gray-700 dark:text-gray-300">
                        {period.duration_years.toFixed(1)}y
                      </p>
                      {period.sub_periods && period.sub_periods.length > 0 && (
                        <p className="text-[10px] md:text-xs text-gray-500">
                          {isExpanded ? '▼' : '▶'} {period.sub_periods.length}
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                {/* Sub-periods (Antardashas) */}
                {isExpanded && period.sub_periods && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-4 md:ml-6 mt-2 space-y-1.5 md:space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-3 md:pl-4"
                  >
                    {period.sub_periods.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex items-center justify-between p-1.5 md:p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                      >
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <span className="text-sm md:text-base" style={{ color: PLANET_COLORS[sub.planet] }}>
                            {PLANET_ICONS[sub.planet]}
                          </span>
                          <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                            {sub.planet}
                          </span>
                        </div>
                        <div className="text-right text-[10px] md:text-xs text-gray-500">
                          <p>{new Date(sub.start_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</p>
                          <p>{sub.duration_years.toFixed(1)}y</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Moon Info */}
      <div className="text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 px-4">
        Based on Moon in <span className="font-medium">{data.moon_nakshatra}</span> nakshatra ({data.moon_sign})
      </div>
    </div>
  );
}
