'use client';

import React from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { WeekDayItem } from './types';

interface WeekMobileNavProps {
  days: WeekDayItem[];
  activeScrollDayIdx: number;
  activitiesByDay: Record<string, USOSActivity[]>;
  onSelectDay: (idx: number) => void;
}

export const WeekMobileNav: React.FC<WeekMobileNavProps> = ({
  days,
  activeScrollDayIdx,
  activitiesByDay,
  onSelectDay,
}) => {
  return (
    <div className="sm:hidden flex items-center space-x-1.5 p-2 px-3 border-b border-black/[0.04] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] overflow-x-auto scrollbar-none touch-momentum">
      <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mr-1 shrink-0">
        Dzień:
      </span>
      {days.map((day, idx) => {
        const isToday = day.isToday;
        const isSelected = activeScrollDayIdx === idx;
        const count = activitiesByDay[day.dateStr]?.length || 0;

        return (
          <button
            key={day.offset}
            type="button"
            onClick={() => onSelectDay(idx)}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-xs font-medium shrink-0 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer ${
              isSelected
                ? 'bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-xs font-semibold scale-[1.02]'
                : isToday
                  ? 'bg-[#fa243c]/15 text-[#fa243c] font-semibold ring-1 ring-[#fa243c]/30'
                  : 'bg-white/70 dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.04] dark:border-white/[0.08]'
            }`}
          >
            <span>{day.short}</span>
            <span className="opacity-80 text-[11px] font-mono">{day.dayNum}</span>
            {count > 0 && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#fa243c]'}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
