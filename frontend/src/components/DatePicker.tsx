'use client';

import { forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { format, getYear, getMonth } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

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

  const selectedDate = value ? new Date(value) : null;

  const years = Array.from(
    { length: 100 },
    (_, i) => getYear(new Date()) - i
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleChange = (date: Date | null) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    }
    setIsOpen(false);
  };

  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-left flex items-center justify-between group"
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {value || placeholder}
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
    )
  );
  CustomInput.displayName = 'CustomInput';

  return (
    <div className="relative">
      <ReactDatePicker
        selected={selectedDate}
        onChange={handleChange}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        customInput={<CustomInput />}
        maxDate={maxDate}
        minDate={minDate}
        showPopperArrow={false}
        dateFormat="dd MMM yyyy"
        popperClassName="date-picker-popper"
        calendarClassName="custom-calendar"
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-2 py-2 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              <select
                value={months[getMonth(date)]}
                onChange={({ target: { value } }) =>
                  changeMonth(months.indexOf(value))
                }
                className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 border-0 text-sm font-medium focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={getYear(date)}
                onChange={({ target: { value } }) => changeYear(Number(value))}
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
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      />

      <style jsx global>{`
        .date-picker-popper {
          z-index: 50 !important;
        }

        .custom-calendar {
          font-family: inherit !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
        }

        .dark .custom-calendar {
          background: #1f2937 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .react-datepicker__header {
          background: white !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
          padding: 0 !important;
        }

        .dark .react-datepicker__header {
          background: #1f2937 !important;
          border-bottom-color: rgba(255, 255, 255, 0.1) !important;
        }

        .react-datepicker__day-names {
          display: flex !important;
          justify-content: space-around !important;
          padding: 8px 0 !important;
          background: #f9fafb !important;
        }

        .dark .react-datepicker__day-names {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          width: 36px !important;
          line-height: 36px !important;
          margin: 0 !important;
        }

        .dark .react-datepicker__day-name {
          color: #9ca3af !important;
        }

        .react-datepicker__month {
          margin: 0 !important;
          padding: 8px !important;
        }

        .react-datepicker__week {
          display: flex !important;
          justify-content: space-around !important;
        }

        .react-datepicker__day {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          margin: 2px !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          color: #374151 !important;
          transition: all 0.15s !important;
        }

        .dark .react-datepicker__day {
          color: #e5e7eb !important;
        }

        .react-datepicker__day:hover {
          background: #f3f4f6 !important;
          border-radius: 10px !important;
        }

        .dark .react-datepicker__day:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: linear-gradient(to right, #c026d3, #4f46e5) !important;
          color: white !important;
          font-weight: 600 !important;
        }

        .react-datepicker__day--selected:hover,
        .react-datepicker__day--keyboard-selected:hover {
          background: linear-gradient(to right, #a21caf, #4338ca) !important;
        }

        .react-datepicker__day--today {
          font-weight: 600 !important;
          border: 2px solid #c026d3 !important;
        }

        .react-datepicker__day--outside-month {
          color: #d1d5db !important;
        }

        .dark .react-datepicker__day--outside-month {
          color: #4b5563 !important;
        }

        .react-datepicker__day--disabled {
          color: #e5e7eb !important;
          cursor: not-allowed !important;
        }

        .dark .react-datepicker__day--disabled {
          color: #374151 !important;
        }
      `}</style>
    </div>
  );
}
