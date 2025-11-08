import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerWithHighlightsProps {
  availableDates: string[]; // Array of dates in "YYYY-MM-DD" format
  selectedDate: string;
  onDateSelect: (date: string) => void;
  photoCountByDate: { [date: string]: number };
}

export const DatePickerWithHighlights: React.FC<DatePickerWithHighlightsProps> = ({
  availableDates,
  selectedDate,
  onDateSelect,
  photoCountByDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (year: number, month: number, day: number): string => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const isDateAvailable = (dateStr: string): boolean => {
    return availableDates.includes(dateStr);
  };

  const isDateSelected = (dateStr: string): boolean => {
    return dateStr === selectedDate;
  };

  const isToday = (year: number, month: number, day: number): boolean => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const days = [];
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const available = isDateAvailable(dateStr);
    const selected = isDateSelected(dateStr);
    const todayDate = isToday(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const photoCount = photoCountByDate[dateStr] || 0;

    days.push(
      <button
        key={day}
        onClick={() => available && onDateSelect(dateStr)}
        disabled={!available}
        className={`
          relative p-2 rounded-lg text-sm transition-all
          ${available ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed opacity-30'}
          ${selected ? 'bg-entrusted-orange text-white hover:bg-orange-600 font-bold' : ''}
          ${!selected && available ? 'font-semibold text-gray-900' : ''}
          ${!selected && !available ? 'text-gray-400' : ''}
          ${todayDate && !selected ? 'ring-2 ring-blue-500' : ''}
        `}
      >
        <div className="flex flex-col items-center">
          <span>{day}</span>
          {available && photoCount > 0 && (
            <span className={`text-xs mt-0.5 ${selected ? 'text-orange-100' : 'text-gray-500'}`}>
              {photoCount}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-entrusted-orange rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-900 rounded" />
          <span>Has photos</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 ring-2 ring-blue-500 rounded" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
