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

const PLANET_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  sun: { symbol: '☉', color: '#FFD700' },
  moon: { symbol: '☽', color: '#C0C0C0' },
  mercury: { symbol: '☿', color: '#90EE90' },
  venus: { symbol: '♀', color: '#FFB6C1' },
  mars: { symbol: '♂', color: '#FF6347' },
  jupiter: { symbol: '♃', color: '#FFA500' },
  saturn: { symbol: '♄', color: '#4169E1' },
  rahu: { symbol: '☊', color: '#483D8B' },
  ketu: { symbol: '☋', color: '#8B4513' },
};

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

  // Size configurations
  const sizeConfig = {
    small: { svgSize: 300, outerRadius: 130, innerRadius: 80, planetRadius: 55, fontSize: 10 },
    medium: { svgSize: 400, outerRadius: 175, innerRadius: 110, planetRadius: 75, fontSize: 12 },
    large: { svgSize: 500, outerRadius: 220, innerRadius: 140, planetRadius: 95, fontSize: 14 },
  };

  const config = sizeConfig[size];
  const center = config.svgSize / 2;

  useEffect(() => {
    fetchTransits();
    // Refresh transits every 5 minutes
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

  // Calculate position on the wheel from longitude
  const getPosition = (longitude: number, radius: number) => {
    // Adjust angle: 0 degrees (Aries) should be at the top, going clockwise
    const angle = ((longitude - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
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
        <h3 className="text-lg font-semibold text-center mb-4">
          Current Planetary Positions
          <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">
            {transits?.date ? new Date(transits.date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : ''}
          </span>
        </h3>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        {/* Zodiac Wheel */}
        <div className="relative">
          <svg
            width={config.svgSize}
            height={config.svgSize}
            className="drop-shadow-lg"
          >
            {/* Background */}
            <circle
              cx={center}
              cy={center}
              r={config.outerRadius}
              fill="url(#wheelGradient)"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200 dark:text-gray-700"
            />

            {/* Gradient definition */}
            <defs>
              <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
              </radialGradient>
            </defs>

            {/* Zodiac sign divisions */}
            {ZODIAC_SIGNS.map((sign, index) => {
              const startAngle = index * 30 - 90;
              const midAngle = startAngle + 15;
              const labelPos = getPosition(index * 30 + 15, config.outerRadius - 25);

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
                    className="fill-gray-600 dark:fill-gray-400"
                    fontSize={config.fontSize + 2}
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
              fill="white"
              stroke="currentColor"
              strokeWidth="2"
              className="dark:fill-gray-900 text-gray-200 dark:text-gray-700"
            />

            {/* Planet positions */}
            {transits?.planets && Object.entries(transits.planets).map(([name, pos], index) => {
              const planetSymbol = PLANET_SYMBOLS[name];
              if (!planetSymbol) return null;

              // Adjust radius to spread planets and avoid overlap
              const radius = config.planetRadius + (index % 3) * 15;
              const position = getPosition(pos.absolute_longitude, radius);

              return (
                <g
                  key={name}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => handlePlanetClick(name)}
                >
                  {/* Planet circle background */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={size === 'small' ? 12 : 15}
                    fill={selectedPlanet === name ? planetSymbol.color : 'white'}
                    className={selectedPlanet !== name ? 'dark:fill-gray-800' : ''}
                    stroke={planetSymbol.color}
                    strokeWidth="2"
                  />
                  {/* Planet symbol */}
                  <text
                    x={position.x}
                    y={position.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={size === 'small' ? 12 : 14}
                    fill={selectedPlanet === name ? 'white' : planetSymbol.color}
                    fontWeight="bold"
                  >
                    {planetSymbol.symbol}
                  </text>
                  {/* Retrograde indicator */}
                  {pos.is_retrograde && (
                    <text
                      x={position.x + (size === 'small' ? 10 : 12)}
                      y={position.y - (size === 'small' ? 8 : 10)}
                      fontSize={size === 'small' ? 8 : 10}
                      fill="#FF4444"
                      fontWeight="bold"
                    >
                      R
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center label */}
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 dark:fill-gray-500"
              fontSize={config.fontSize - 2}
            >
              Click a planet
            </text>
          </svg>
        </div>

        {/* Planet Info Panel */}
        <AnimatePresence>
          {(selectedPlanet || planetInfo) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-72 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {infoLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : planetInfo ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: PLANET_SYMBOLS[selectedPlanet!]?.color + '20' }}
                    >
                      {planetInfo.symbol}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{planetInfo.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {planetInfo.name_hindi}
                      </p>
                    </div>
                  </div>

                  {planetInfo.current_position && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Current Position</p>
                      <p className="text-lg font-semibold">
                        {planetInfo.current_position.sign} ({planetInfo.current_position.sign_hindi})
                      </p>
                      <p className="text-sm text-gray-500">
                        {planetInfo.current_position.degree.toFixed(2)}°
                        {planetInfo.current_position.is_retrograde && (
                          <span className="ml-2 text-red-500 font-medium">Retrograde</span>
                        )}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {planetInfo.description}
                  </p>

                  <p className="text-xs text-gray-400">
                    Orbital Period: {planetInfo.orbital_period}
                  </p>
                </>
              ) : (
                <p className="text-center text-gray-500 py-4">Select a planet to view details</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Planet Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {Object.entries(PLANET_SYMBOLS).map(([name, { symbol, color }]) => (
          <button
            key={name}
            onClick={() => handlePlanetClick(name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedPlanet === name
                ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-primary-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            style={selectedPlanet === name ? { '--tw-ring-color': color } as React.CSSProperties : undefined}
          >
            <span style={{ color }}>{symbol}</span>
            <span className="capitalize text-gray-700 dark:text-gray-300">{name}</span>
            {transits?.planets[name]?.is_retrograde && (
              <span className="text-xs text-red-500 font-medium">R</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
