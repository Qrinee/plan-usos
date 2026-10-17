'use client';

import React from 'react';
import {
  Grid3X3,
  Columns,
  List,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

export type ViewMode = 'week' | 'day' | 'list';

interface TimetableControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isNavigatingWeek?: boolean;
  baseMonday?: Date;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
}

export const TimetableControls: React.FC<TimetableControlsProps> = ({
  viewMode,
  setViewMode,
  isNavigatingWeek = false,
  baseMonday,
  onPrevWeek,
  onNextWeek,
  onToday,
}) => {
  const sunday = baseMonday ? new Date(baseMonday) : new Date();
  if (baseMonday) sunday.setDate(baseMonday.getDate() + 6);

  const startDay = baseMonday ? baseMonday.getDate() : 1;
  const endDay = sunday.getDate();
  const monthName = sunday.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  const weekLabel = `${startDay} – ${endDay} ${monthName}`;

  return (
    <div className="space-y-3 w-full">
      <div className="relative justify-center flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 apple-card rounded-3xl p-3 sm:px-4 sm:py-3 overflow-hidden">
        {isNavigatingWeek && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-black/[0.04] dark:bg-white/[0.08] overflow-hidden z-20">
            <div className="h-full bg-gradient-to-r from-[#fa243c] via-[#fb5c74] to-[#a855f7] animate-pulse w-full shadow-[0_0_8px_rgba(250,36,60,0.8)]" />
          </div>
        )}


        {/* View Mode Segmented Switcher */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="apple-segmented-container flex-1 md:flex-initial grid grid-cols-3 md:flex items-center p-0.5">
            <button
              onClick={() => setViewMode('week')}
              className={`py-1.5 px-2 md:px-2.5 md:py-1 min-h-[34px] md:min-h-0 rounded-full text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${viewMode === 'week'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              title="Widok siatki"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Siatka</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`py-1.5 px-2 md:px-2.5 md:py-1 min-h-[34px] md:min-h-0 rounded-full text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${viewMode === 'day'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              title="Widok dnia"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dzień</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`py-1.5 px-2 md:px-2.5 md:py-1 min-h-[34px] md:min-h-0 rounded-full text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${viewMode === 'list'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              title="Widok listy"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
