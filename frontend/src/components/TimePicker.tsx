'use client';

import { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hour24 = parseInt(h, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      setHours(hour12.toString().padStart(2, '0'));
      setMinutes(m);
      setPeriod(hour24 >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeChange = (newHours: string, newMinutes: string, newPeriod: 'AM' | 'PM') => {
    const h = parseInt(newHours, 10);
    const hour24 = newPeriod === 'AM'
      ? (h === 12 ? 0 : h)
      : (h === 12 ? 12 : h + 12);
    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinutes}`;
    onChange(timeString);
  };

  const handleHourSelect = (hour: number) => {
    const newHours = hour.toString().padStart(2, '0');
    setHours(newHours);
    if (minutes) {
      handleTimeChange(newHours, minutes, period);
    }
  };

  const handleMinuteSelect = (minute: number) => {
    const newMinutes = minute.toString().padStart(2, '0');
    setMinutes(newMinutes);
    if (hours) {
      handleTimeChange(hours, newMinutes, period);
    }
  };

  const handlePeriodSelect = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    if (hours && minutes) {
      handleTimeChange(hours, minutes, newPeriod);
    }
  };

  const displayValue = value
    ? `${hours}:${minutes} ${period}`
    : '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-left flex items-center justify-between group"
      >
        <span className={displayValue ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-3 text-center">Select time of birth</p>

            <div className="flex gap-2">
              {/* Hours */}
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-2 text-center">Hour</p>
                <div className="h-48 overflow-y-auto scrollbar-thin">
                  <div className="space-y-1">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleHourSelect(hour)}
                        className={`w-full py-2 px-3 rounded-lg text-center transition-all ${
                          hours === hour.toString().padStart(2, '0')
                            ? 'bg-gradient-to-r from-primary-500 to-cosmic-500 text-white font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        {hour.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Minutes */}
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-2 text-center">Minute</p>
                <div className="h-48 overflow-y-auto scrollbar-thin">
                  <div className="space-y-1">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => handleMinuteSelect(minute)}
                        className={`w-full py-2 px-3 rounded-lg text-center transition-all ${
                          minutes === minute.toString().padStart(2, '0')
                            ? 'bg-gradient-to-r from-primary-500 to-cosmic-500 text-white font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        {minute.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AM/PM */}
              <div className="w-20">
                <p className="text-xs text-gray-400 mb-2 text-center">Period</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePeriodSelect('AM')}
                    className={`w-full py-3 rounded-lg text-center font-medium transition-all ${
                      period === 'AM'
                        ? 'bg-gradient-to-r from-primary-500 to-cosmic-500 text-white'
                        : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodSelect('PM')}
                    className={`w-full py-3 rounded-lg text-center font-medium transition-all ${
                      period === 'PM'
                        ? 'bg-gradient-to-r from-primary-500 to-cosmic-500 text-white'
                        : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Quick select common times */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-400 mb-2">Quick select</p>
              <div className="flex flex-wrap gap-2">
                {['06:00', '08:00', '10:00', '12:00', '14:00', '18:00', '20:00', '22:00'].map((time) => {
                  const [h] = time.split(':');
                  const hour24 = parseInt(h, 10);
                  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                  const p = hour24 >= 12 ? 'PM' : 'AM';
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        onChange(time);
                        setHours(hour12.toString().padStart(2, '0'));
                        setMinutes('00');
                        setPeriod(p);
                        setIsOpen(false);
                      }}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-white/10 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {hour12}:00 {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Done button */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-gradient-to-r from-primary-600 to-cosmic-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-cosmic-500 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
