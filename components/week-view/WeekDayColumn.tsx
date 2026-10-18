'use client';

import React from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { WEEK_HOUR_HEIGHT, WeekDayItem, CurrentTimeInfo } from './types';
import { WeekActivityCard } from './WeekActivityCard';

interface WeekDayColumnProps {
  day: WeekDayItem;
  hours: number[];
  activities: USOSActivity[];
  hasTodayInWeek: boolean;
  currentTimeInfo: CurrentTimeInfo;
  startHour: number;
  now: Date;
  onSelectActivity: (act: USOSActivity) => void;
}

export const WeekDayColumn: React.FC<WeekDayColumnProps> = ({
  day,
  hours,
  activities,
  hasTodayInWeek,
  currentTimeInfo,
  startHour,
  now,
  onSelectActivity,
}) => {
  return (
    <div
      className={`relative border-r last:border-r-0 border-black/[0.04] dark:border-white/[0.06] transition-colors ${
        day.isToday ? 'bg-[#fa243c]/[0.02] dark:bg-[#fa243c]/[0.04]' : ''
      }`}
    >
      {/* Hourly horizontal grid lines */}
      {hours.map((hour) => (
        <div
          key={hour}
          className="border-b border-black/[0.03] dark:border-white/[0.04] pointer-events-none"
          style={{ height: `${WEEK_HOUR_HEIGHT}px` }}
        />
      ))}

      {/* Dashed line on non-today days */}
      {!day.isToday && hasTodayInWeek && currentTimeInfo.inGrid && (
        <div
          className="absolute left-0 right-0 z-10 pointer-events-none border-b border-dashed border-[#fa243c]/20"
          style={{ top: `${currentTimeInfo.top}px` }}
        />
      )}

      {/* Red Live Time Line on today's column */}
      {day.isToday && currentTimeInfo.inGrid && (
        <div
          className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
          style={{ top: `${currentTimeInfo.top}px` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#fa243c] ring-3 ring-[#fa243c]/30 -ml-1 shadow-xs flex items-center justify-center shrink-0">
            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
          </div>
          <div className="flex-1 h-[1.5px] bg-[#fa243c] shadow-[0_0_8px_rgba(250,36,60,0.7)]" />
          <span className="text-[9px] font-mono font-bold bg-[#fa243c] text-white px-1.5 py-0.5 rounded-full shadow-xs ml-1 shrink-0 flex items-center space-x-1">
            <span>{currentTimeInfo.timeString}</span>
          </span>
        </div>
      )}

      {/* Subject Activity Blocks */}
      {activities.map((act) => (
        <WeekActivityCard
          key={act.id}
          activity={act}
          startHour={startHour}
          now={now}
          onSelect={onSelectActivity}
        />
      ))}
    </div>
  );
};
