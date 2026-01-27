'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface PlaceResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface PlacePickerProps {
  value: string;
  onChange: (place: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function PlacePicker({
  value,
  onChange,
  placeholder = 'Search for a city...',
  required = false,
}: PlacePickerProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync inputValue with value prop when it changes externally
  useEffect(() => {
    if (value !== inputValue && !isOpen) {
      setInputValue(value || '');
    }
  }, [value, isOpen]);

  // Fetch suggestions from Nominatim API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Use Nominatim API without restrictive filter for better results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=8`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data: PlaceResult[] = await response.json();

      // Filter to prioritize cities/towns but don't exclude all results
      const filtered = data.filter((place) => {
        const addr = place.address;
        return addr?.city || addr?.town || addr?.village;
      });

      setSuggestions(filtered.length > 0 ? filtered : data.slice(0, 6));
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching places:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    },
    [fetchSuggestions]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If user typed something and closed dropdown, use that as the value
        if (inputValue && inputValue !== value) {
          onChange(inputValue);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, value, onChange]);

  // Format place name for display
  const formatPlace = (place: PlaceResult): string => {
    const parts: string[] = [];
    const addr = place.address;

    if (addr) {
      const city = addr.city || addr.town || addr.village;
      if (city) parts.push(city);
      if (addr.state && addr.state !== city) parts.push(addr.state);
      if (addr.country) parts.push(addr.country);
    }

    return parts.length > 0 ? parts.join(', ') : place.display_name.split(',').slice(0, 3).join(',').trim();
  };

  // Handle selection
  const handleSelect = (place: PlaceResult) => {
    const formatted = formatPlace(place);
    setInputValue(formatted);
    onChange(formatted);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setHasSearched(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
      }
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      } else if (inputValue) {
        // Allow custom input on Enter
        onChange(inputValue);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    if (newValue.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setHasSearched(false);
    } else {
      debouncedSearch(newValue);
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <svg className="w-5 h-5 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          {suggestions.length > 0 ? (
            <ul className="py-2 max-h-64 overflow-y-auto">
              {suggestions.map((place, index) => {
                const formatted = formatPlace(place);
                const parts = formatted.split(', ');
                const city = parts[0];
                const rest = parts.slice(1).join(', ');

                return (
                  <li key={`${place.lat}-${place.lon}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(place)}
                      className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                        index === selectedIndex
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {city}
                        </p>
                        {rest && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {rest}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : hasSearched && !isLoading ? (
            <div className="px-4 py-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                No places found for &quot;{inputValue}&quot;
              </p>
              <p className="text-xs text-gray-400">
                You can type the city name manually and press Enter
              </p>
            </div>
          ) : null}

          {/* Powered by attribution (required by Nominatim) */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-400 text-center">
                Powered by OpenStreetMap
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
