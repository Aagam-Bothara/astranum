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

const PLANET_DATA: Record<string, { name: string; hindi: string; symbol: string; color: string }> = {
  sun: { name: 'Sun', hindi: 'Surya', symbol: '☉', color: '#FFD700' },
  moon: { name: 'Moon', hindi: 'Chandra', symbol: '☽', color: '#E8E8E8' },
  mercury: { name: 'Mercury', hindi: 'Budha', symbol: '☿', color: '#4ADE80' },
  venus: { name: 'Venus', hindi: 'Shukra', symbol: '♀', color: '#F472B6' },
  mars: { name: 'Mars', hindi: 'Mangal', symbol: '♂', color: '#EF4444' },
  jupiter: { name: 'Jupiter', hindi: 'Guru', symbol: '♃', color: '#FB923C' },
  saturn: { name: 'Saturn', hindi: 'Shani', symbol: '♄', color: '#60A5FA' },
  rahu: { name: 'Rahu', hindi: 'Rahu', symbol: '☊', color: '#A78BFA' },
  ketu: { name: 'Ketu', hindi: 'Ketu', symbol: '☋', color: '#F97316' },
};

// Order planets by their typical distance from sun
const PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];

interface PlanetaryPositionsProps {
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function PlanetaryPositions({ showTitle = true, size = 'medium' }: PlanetaryPositionsProps) {
  const [transits, setTransits] = useState<TransitData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [planetInfo, setPlanetInfo] = useState<PlanetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'wheel'>('list');

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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        {error}
        <button
          onClick={fetchTransits}
          className="block mx-auto mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {showTitle && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-1">Current Planetary Positions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transits?.date ? new Date(transits.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : ''}
          </p>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('wheel')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'wheel'
                ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Wheel View
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {viewMode === 'list' ? (
            <PlanetList
              transits={transits}
              selectedPlanet={selectedPlanet}
              onPlanetClick={handlePlanetClick}
            />
          ) : (
            <PlanetWheel
              transits={transits}
              selectedPlanet={selectedPlanet}
              onPlanetClick={handlePlanetClick}
              size={size}
            />
          )}
        </div>

        {/* Planet Info Panel */}
        <AnimatePresence>
          {selectedPlanet && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-80 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {infoLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : planetInfo ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: PLANET_DATA[selectedPlanet]?.color + '25', color: PLANET_DATA[selectedPlanet]?.color }}
                    >
                      {planetInfo.symbol}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl">{planetInfo.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {planetInfo.name_hindi}
                      </p>
                    </div>
                  </div>

                  {planetInfo.current_position && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-cosmic-50 dark:from-primary-900/20 dark:to-cosmic-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                      <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">Current Position</p>
                      <p className="text-xl font-bold">
                        {planetInfo.current_position.sign}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {planetInfo.current_position.sign_hindi} • {planetInfo.current_position.degree.toFixed(2)}°
                      </p>
                      {planetInfo.current_position.is_retrograde && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded">
                          Retrograde
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {planetInfo.description}
                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Orbital Period: {planetInfo.orbital_period}
                  </p>

                  <button
                    onClick={() => { setSelectedPlanet(null); setPlanetInfo(null); }}
                    className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Close
                  </button>
                </>
              ) : (
                <p className="text-center text-gray-500 py-4">Select a planet to view details</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PlanetList({
  transits,
  selectedPlanet,
  onPlanetClick
}: {
  transits: TransitData | null;
  selectedPlanet: string | null;
  onPlanetClick: (name: string) => void;
}) {
  if (!transits) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PLANET_ORDER.map((planetKey) => {
        const planet = PLANET_DATA[planetKey];
        const position = transits.planets[planetKey];
        if (!planet || !position) return null;

        const signData = ZODIAC_SIGNS.find(s => s.name === position.sign);

        return (
          <motion.button
            key={planetKey}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPlanetClick(planetKey)}
            className={`p-4 rounded-xl text-left transition-all border-2 ${
              selectedPlanet === planetKey
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
            } shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center gap-3">
              {/* Planet Symbol */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor: planet.color + '20',
                  color: planet.color,
                }}
              >
                {planet.symbol}
              </div>

              {/* Planet Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {planet.name}
                  </span>
                  {position.is_retrograde && (
                    <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded">
                      R
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {planet.hindi}
                </div>
              </div>

              {/* Sign */}
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{signData?.symbol}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {position.sign}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {position.degree.toFixed(1)}°
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function PlanetWheel({
  transits,
  selectedPlanet,
  onPlanetClick,
  size = 'medium'
}: {
  transits: TransitData | null;
  selectedPlanet: string | null;
  onPlanetClick: (name: string) => void;
  size: 'small' | 'medium' | 'large';
}) {
  const sizeConfig = {
    small: { svgSize: 350, outerRadius: 155, innerRadius: 95, fontSize: 14 },
    medium: { svgSize: 450, outerRadius: 200, innerRadius: 125, fontSize: 16 },
    large: { svgSize: 550, outerRadius: 245, innerRadius: 155, fontSize: 18 },
  };

  const config = sizeConfig[size];
  const center = config.svgSize / 2;

  // Calculate position on the wheel from longitude
  const getPosition = (longitude: number, radius: number) => {
    const angle = ((longitude - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Group planets by sign to handle overlaps
  const planetsBySign: Record<string, Array<{ name: string; pos: PlanetPosition }>> = {};
  if (transits) {
    Object.entries(transits.planets).forEach(([name, pos]) => {
      const signIndex = Math.floor(pos.absolute_longitude / 30);
      if (!planetsBySign[signIndex]) {
        planetsBySign[signIndex] = [];
      }
      planetsBySign[signIndex].push({ name, pos });
    });
  }

  // Calculate adjusted positions to avoid overlap
  const getAdjustedPlanetPositions = () => {
    const positions: Array<{ name: string; x: number; y: number; pos: PlanetPosition }> = [];

    Object.values(planetsBySign).forEach((planetsInSign) => {
      planetsInSign.forEach((planet, idx) => {
        // Vary the radius based on position in group
        const baseRadius = (config.outerRadius + config.innerRadius) / 2;
        const radiusOffset = (idx - (planetsInSign.length - 1) / 2) * 25;
        const radius = baseRadius + radiusOffset;

        const { x, y } = getPosition(planet.pos.absolute_longitude, radius);
        positions.push({ name: planet.name, x, y, pos: planet.pos });
      });
    });

    return positions;
  };

  const planetPositions = getAdjustedPlanetPositions();

  return (
    <div className="flex justify-center">
      <svg
        width={config.svgSize}
        height={config.svgSize}
        className="drop-shadow-xl"
      >
        {/* Definitions */}
        <defs>
          <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.08)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.03)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring background */}
        <circle
          cx={center}
          cy={center}
          r={config.outerRadius}
          fill="url(#wheelBg)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:text-gray-600"
        />

        {/* Zodiac segments */}
        {ZODIAC_SIGNS.map((sign, index) => {
          const startAngle = index * 30 - 90;
          const labelPos = getPosition(index * 30 + 15, config.outerRadius - 30);

          return (
            <g key={sign.name}>
              {/* Division line */}
              <line
                x1={center + config.innerRadius * Math.cos((startAngle * Math.PI) / 180)}
                y1={center + config.innerRadius * Math.sin((startAngle * Math.PI) / 180)}
                x2={center + config.outerRadius * Math.cos((startAngle * Math.PI) / 180)}
                y2={center + config.outerRadius * Math.sin((startAngle * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-300 dark:text-gray-600"
              />
              {/* Sign symbol */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-500 dark:fill-gray-400"
                fontSize={config.fontSize}
                fontWeight="500"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Inner circle */}
        <circle
          cx={center}
          cy={center}
          r={config.innerRadius}
          className="fill-white dark:fill-gray-900"
          stroke="currentColor"
          strokeWidth="2"
          style={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
        />

        {/* Planet positions */}
        {planetPositions.map(({ name, x, y, pos }) => {
          const planet = PLANET_DATA[name];
          if (!planet) return null;

          const isSelected = selectedPlanet === name;

          return (
            <g
              key={name}
              className="cursor-pointer"
              onClick={() => onPlanetClick(name)}
              filter={isSelected ? 'url(#glow)' : undefined}
            >
              {/* Planet circle */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 22 : 18}
                fill={isSelected ? planet.color : 'white'}
                stroke={planet.color}
                strokeWidth={isSelected ? 3 : 2}
                className={!isSelected ? 'dark:fill-gray-800' : ''}
              />
              {/* Planet symbol */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isSelected ? 18 : 16}
                fill={isSelected ? 'white' : planet.color}
                fontWeight="bold"
              >
                {planet.symbol}
              </text>
              {/* Retrograde indicator */}
              {pos.is_retrograde && (
                <g>
                  <circle
                    cx={x + 14}
                    cy={y - 14}
                    r={8}
                    fill="#EF4444"
                  />
                  <text
                    x={x + 14}
                    y={y - 14}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="white"
                    fontWeight="bold"
                  >
                    R
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Center text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-400 dark:fill-gray-500"
          fontSize={12}
        >
          Vedic Zodiac
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-300 dark:fill-gray-600"
          fontSize={10}
        >
          Click any planet
        </text>
      </svg>
    </div>
  );
}
