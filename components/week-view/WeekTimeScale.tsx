'use client';

import React from 'react';
import { WEEK_HOUR_HEIGHT, CurrentTimeInfo } from './types';

interface WeekTimeScaleProps {
  hours: number[];
  hasTodayInWeek: boolean;
  currentTimeInfo: CurrentTimeInfo;
}

export const WeekTimeScale: React.FC<WeekTimeScaleProps> = ({
  hours,
  hasTodayInWeek,
  currentTimeInfo,
}) => {
  return (
    <div className="sticky left-0 z-20 border-r border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md select-none shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.4)]">
      {hours.map((hour) => (
        <div
          key={hour}
          className="relative border-b border-black/[0.03] dark:border-white/[0.04] text-[10px] sm:text-[11px] text-[#86868b] font-medium text-center font-mono"
          style={{ height: `${WEEK_HOUR_HEIGHT}px` }}
        >
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1c1c1e] px-1 rounded text-[10px] z-10 font-mono">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}

      {hasTodayInWeek && currentTimeInfo.inGrid && (
        <div
          className="absolute right-0 -translate-y-1/2 z-40 flex items-center pointer-events-none"
          style={{ top: `${currentTimeInfo.top}px` }}
        >
          <span className="text-[9px] font-mono font-bold bg-[#fa243c] text-white px-1.5 py-0.5 rounded-l shadow-xs shadow-[#fa243c]/30">
            {currentTimeInfo.timeString}
          </span>
          <span className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[3px] border-l-[#fa243c]" />
        </div>
      )}
    </div>
  );
};
