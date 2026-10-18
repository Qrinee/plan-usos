'use client';

import React from 'react';
import { formatTime } from '@/lib/utils/date';
import { DayItem } from './types';

interface DayViewHeaderProps {
  activeDay?: DayItem;
  activityCount: number;
  isNavigatingWeek: boolean;
  now: Date;
}

export const DayViewHeader: React.FC<DayViewHeaderProps> = ({
  activeDay,
  activityCount,
  isNavigatingWeek,
  now,
}) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          {activeDay?.name},{' '}
          {activeDay?.date.toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <p className="text-[11px] text-[#86868b] mt-0.5">
          {activityCount === 0
            ? 'Dzień wolny od zajęć dydaktycznych'
            : `${activityCount} ${activityCount === 1 ? 'zajęcia' : 'zajęć'} zaplanowanych`}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {isNavigatingWeek && (
          <span className="text-[11px] text-[#fa243c] font-medium flex items-center space-x-1 animate-pulse">
            <span>Ładowanie...</span>
          </span>
        )}
        {activeDay?.isToday && !isNavigatingWeek && (
          <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#fa243c]/10 text-[#fa243c] text-[11px] sm:text-xs font-semibold shrink-0">
            <span>Dziś  {formatTime(now)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
