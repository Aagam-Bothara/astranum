'use client';

import { useState, useRef, useEffect } from 'react';
import { format, getYear, getMonth, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  maxDate = new Date(),
  minDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const currentYear = getYear(new Date());

  // Generate years from 1920 to current year
  const years = Array.from(
    { length: currentYear - 1919 },
    (_, i) => currentYear - i
  );

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

  // Update viewDate when value changes
  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(getYear(viewDate), getMonth(viewDate), day);
    onChange(format(newDate, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const changeYear = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
  };

  const changeMonthDirect = (month: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(month);
    setViewDate(newDate);
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(viewDate);
  const firstDayOfMonth = getDay(startOfMonth(viewDate));
  const days: (number | null)[] = [];

  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(getYear(viewDate), getMonth(viewDate), day);
    if (maxDate && date > maxDate) return true;
    if (minDate && date < minDate) return true;
    return false;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      getMonth(viewDate) === selectedDate.getMonth() &&
      getYear(viewDate) === selectedDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      getMonth(viewDate) === today.getMonth() &&
      getYear(viewDate) === today.getFullYear()
    );
  };

  const displayValue = selectedDate ? format(selectedDate, 'dd MMM yyyy') : '';

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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              <select
                value={getMonth(viewDate)}
                onChange={(e) => changeMonthDirect(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 border-0 text-sm font-medium focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {months.map((month, idx) => (
                  <option key={month} value={idx}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={getYear(viewDate)}
                onChange={(e) => changeYear(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 border-0 text-sm font-medium focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 px-3 py-2 bg-gray-50 dark:bg-white/5">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 p-3">
            {days.map((day, idx) => (
              <div key={idx} className="aspect-square">
                {day !== null ? (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={isDateDisabled(day)}
                    className={`w-full h-full rounded-lg text-sm font-medium transition-all ${
                      isSelected(day)
                        ? 'bg-gradient-to-r from-primary-500 to-cosmic-500 text-white'
                        : isToday(day)
                        ? 'border-2 border-primary-500 text-primary-600 dark:text-primary-400'
                        : isDateDisabled(day)
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* Quick select for common birth years */}
          <div className="px-3 pb-3 border-t border-gray-100 dark:border-white/10 pt-2">
            <p className="text-xs text-gray-400 mb-2">Quick select year</p>
            <div className="flex flex-wrap gap-1">
              {[1990, 1995, 2000, 2005].map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => changeYear(year)}
                  className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-white/10 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
