'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavHeaderProps {
  weekRangeStr: string;
  isNavigatingWeek: boolean;
  hasTodayInWeek: boolean;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
}

export const WeekNavHeader: React.FC<WeekNavHeaderProps> = ({
  weekRangeStr,
  isNavigatingWeek,
  hasTodayInWeek,
  onPrevWeek,
  onNextWeek,
  onToday,
}) => {
  return (
    <div className="flex items-center justify-between px-1 text-xs sm:text-sm">
      <div className="flex items-center space-x-1.5 font-medium">
        <Calendar className="w-3.5 h-3.5 text-[#fa243c]" />
        <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-xs sm:text-sm">
          Tydzień {weekRangeStr}
        </span>
        {isNavigatingWeek && (
          <span className="text-[10px] text-[#fa243c] animate-pulse font-normal">
            • Ładowanie...
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1 sm:space-x-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] p-0.5">
        <button
          onClick={onPrevWeek}
          disabled={isNavigatingWeek}
          className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
          title="Poprzedni tydzień (←)"
          aria-label="Poprzedni tydzień"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {onToday && (
          <button
            onClick={onToday}
            disabled={isNavigatingWeek}
            className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all active:scale-95 disabled:opacity-40 ${
              hasTodayInWeek
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
            }`}
            title="Bieżący tydzień (T)"
          >
            Dziś
          </button>
        )}
        <button
          onClick={onNextWeek}
          disabled={isNavigatingWeek}
          className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
          title="Następny tydzień (→)"
          aria-label="Następny tydzień"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
