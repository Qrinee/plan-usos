'use client';

import React from 'react';
import { Coffee } from 'lucide-react';
import { formatTime } from '@/lib/utils/date';
import { TimetableBreak } from './types';
import { TIMELINE_START_HOUR, HOUR_HEIGHT, formatBreakDuration } from './timelineUtils';

interface DayBreakCardProps {
  breakInfo: TimetableBreak;
  now: Date;
  isToday: boolean;
  bIdx: number;
}

export const DayBreakCard: React.FC<DayBreakCardProps> = ({
  breakInfo,
  now,
  isToday,
  bIdx,
}) => {
  const bStartMin = breakInfo.startTime.getHours() * 60 + breakInfo.startTime.getMinutes();
  const bEndMin = breakInfo.endTime.getHours() * 60 + breakInfo.endTime.getMinutes();
  const bTop = ((bStartMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const bHeight = ((bEndMin - bStartMin) / 60) * HOUR_HEIGHT;

  if (breakInfo.durationMinutes < 15 || bHeight < 24) return null;

  const duration = formatBreakDuration(breakInfo.durationMinutes);
  const isCurrentBreak =
    isToday &&
    now.getTime() >= breakInfo.startTime.getTime() &&
    now.getTime() < breakInfo.endTime.getTime();

  return (
    <div
      className={`absolute left-1 right-1 rounded-xl p-1.5 sm:p-2 border border-dashed transition-all duration-200 flex flex-col justify-center anim-item-card ${isCurrentBreak
        ? 'bg-[#fa243c]/[0.08] dark:bg-[#fa243c]/[0.15] border-[#fa243c]/50 ring-1 ring-[#fa243c]/30 shadow-xs'
        : breakInfo.isWindow
          ? 'bg-[#ff9500]/[0.05] dark:bg-[#ff9f0a]/[0.08] border-[#ff9500]/30 text-[#ff9500] dark:text-[#ff9f0a]'
          : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/10 dark:border-white/10 text-[#86868b]'
        }`}
      style={{
        top: bTop + 3,
        height: Math.max(26, bHeight - 6),
        animationDelay: `${Math.min(bIdx * 35, 150)}ms`,
      }}
    >
      <div className="flex items-center justify-between text-[11px] gap-2">
        <div className="flex items-center space-x-1.5 font-medium truncate">
          <Coffee className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">
            {duration.short} {breakInfo.isWindow ? 'okienka' : 'przerwy'}
          </span>
          <span className="text-[10px] opacity-75 font-mono hidden xs:inline">
            ({formatTime(breakInfo.startTime)} – {formatTime(breakInfo.endTime)})
          </span>
        </div>
      </div>
    </div>
  );
};
