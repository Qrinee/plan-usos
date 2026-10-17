'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Grid3X3,
  List,
  Columns,
  SlidersHorizontal,
} from 'lucide-react';

export type ViewMode = 'week' | 'day' | 'list';

interface TimetableControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  baseMonday: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showWeekend: boolean;
  setShowWeekend: (show: boolean) => void;
  isNavigatingWeek?: boolean;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'wykład', label: 'Wykłady' },
  { id: 'laboratorium', label: 'Laboratoria' },
  { id: 'ćwiczenia', label: 'Ćwiczenia' },
  { id: 'projekt', label: 'Projekty' },
  { id: 'seminarium', label: 'Seminaria' },
  { id: 'lektorat', label: 'Lektoraty' },
];

export const TimetableControls: React.FC<TimetableControlsProps> = ({
  viewMode,
  setViewMode,
  baseMonday,
  onPrevWeek,
  onNextWeek,
  onToday,
  selectedCategory,
  setSelectedCategory,
  showWeekend,
  setShowWeekend,
  isNavigatingWeek = false,
}) => {
  const sunday = new Date(baseMonday);
  sunday.setDate(baseMonday.getDate() + 6);

  const startDay = baseMonday.getDate();
  const endDay = sunday.getDate();
  const monthName = sunday.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  const weekLabel = `${startDay} – ${endDay} ${monthName}`;

  return (
    <div className="space-y-3 w-full">
      <div className="relative z-10 flex items-center space-x-2 overflow-x-auto scrollbar-none touch-momentum p-1.5 px-2.5 sm:px-3 rounded-2xl apple-glass shadow-xs text-xs">
        <div className="flex items-center space-x-1.5 pr-2 border-r border-black/[0.08] dark:border-white/[0.1] shrink-0 text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#fa243c]" />
          <span className="hidden sm:inline text-xs">Kategorie:</span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none touch-momentum py-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-3.5 py-1.5 min-h-[34px] cursor-pointer rounded-full text-xs shrink-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 ${isSelected
                  ? 'bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-md shadow-[#fa243c]/30 font-semibold scale-[1.03] anim-pill-pop'
                  : 'bg-white/70 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.16] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.12] font-medium shadow-2xs hover:scale-[1.02]'
                  }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 apple-card rounded-3xl p-3 sm:px-4 sm:py-3 overflow-hidden">
        {isNavigatingWeek && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-black/[0.04] dark:bg-white/[0.08] overflow-hidden z-20">
            <div className="h-full bg-gradient-to-r from-[#fa243c] via-[#fb5c74] to-[#a855f7] animate-pulse w-full shadow-[0_0_8px_rgba(250,36,60,0.8)]" />
          </div>
        )}

        <div className="flex items-center justify-between md:justify-start space-x-2 sm:space-x-2.5">
          <div className={`items-center rounded-full bg-black/[0.04] dark:bg-white/[0.08] p-0.5 shrink-0 ${
            viewMode === 'day' ? 'hidden sm:flex' : 'flex'
          }`}>
            <button
              onClick={onPrevWeek}
              disabled={isNavigatingWeek}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
              title="Poprzedni tydzień"
              aria-label="Poprzedni tydzień"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              disabled={isNavigatingWeek}
              className="px-3 py-1 min-h-[32px] sm:min-h-0 text-xs cursor-pointer font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.06] dark:hover:bg-white/[0.12] rounded-full active:scale-95 transition-all disabled:opacity-40"
            >
              Dziś
            </button>
            <button
              onClick={onNextWeek}
              disabled={isNavigatingWeek}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
              title="Następny tydzień"
              aria-label="Następny tydzień"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate pl-1">
            <CalendarIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fa243c] shrink-0 transition-transform ${isNavigatingWeek ? 'animate-spin' : ''}`} />
            <span key={weekLabel} className={`capitalize anim-filter-fade truncate transition-opacity ${isNavigatingWeek ? 'opacity-60' : ''}`}>
              {weekLabel}
            </span>
          </div>
        </div>

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
