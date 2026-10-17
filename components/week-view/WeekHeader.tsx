'use client';

import React from 'react';
import { WeekDayItem, CurrentTimeInfo } from './types';

interface WeekHeaderProps {
  days: WeekDayItem[];
  currentTimeInfo: CurrentTimeInfo;
  onSelectDay: (idx: number) => void;
}

export const WeekHeader: React.FC<WeekHeaderProps> = ({
  days,
  currentTimeInfo,
  onSelectDay,
}) => {
  return (
    <div
      className="grid border-b border-black/[0.04] dark:border-white/[0.06] apple-glass select-none sticky top-0 z-30"
      style={{
        gridTemplateColumns: `48px repeat(${days.length}, minmax(165px, 1fr))`,
      }}
    >
      <div className="sticky left-0 z-40 p-2 text-center border-r border-black/[0.06] dark:border-white/[0.08] text-[10px] sm:text-[11px] font-semibold text-[#86868b] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.4)] flex items-center justify-center">
        Godz.
      </div>

      {days.map((day, idx) => (
        <div
          key={day.offset}
          onClick={() => onSelectDay(idx)}
          className={`py-2 sm:py-3 px-2 text-center border-r last:border-r-0 border-black/[0.04] dark:border-white/[0.06] transition-colors cursor-pointer select-none ${
            day.isToday ? 'bg-[#fa243c]/[0.04] dark:bg-[#fa243c]/[0.08]' : ''
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
            <span
              className={`text-[11px] font-medium ${
                day.isToday ? 'text-[#fa243c] font-semibold' : 'text-[#86868b]'
              }`}
            >
              {day.short}
            </span>
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                day.isToday
                  ? 'bg-[#fa243c] text-white shadow-xs shadow-[#fa243c]/30'
                  : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}
            >
              {day.dayNum}
            </span>
          </div>

          {day.isToday && (
            <div className="mt-0.5 sm:mt-1 flex items-center justify-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fa243c] animate-ping shrink-0" />
              <span className="text-[10px] font-mono font-medium text-[#fa243c]">
                {currentTimeInfo.timeString}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
