'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { formatTime, parseDate } from '@/lib/utils/date';
import { DayActivityCard } from './DayActivityCard';
import { DayBreakCard } from './DayBreakCard';
import {
  TIMELINE_START_HOUR,
  TIMELINE_END_HOUR,
  HOUR_HEIGHT,
  TOTAL_TIMELINE_HEIGHT,
  computeDayBreaks,
  computeTimelineLayout,
} from './timelineUtils';

interface DayTimelineProps {
  activities: USOSActivity[];
  isToday: boolean;
  now: Date;
  selectedDateStr: string;
  onSelectActivity: (act: USOSActivity) => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  activities,
  isToday,
  now,
  selectedDateStr,
  onSelectActivity,
}) => {
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const lastScrolledDateRef = useRef<string>('');

  const timelineItems = useMemo(() => computeTimelineLayout(activities), [activities]);
  const dayBreaks = useMemo(() => computeDayBreaks(activities), [activities]);

  const timelineHours = useMemo(() => {
    const arr = [];
    for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
      arr.push(h);
    }
    return arr;
  }, []);

  // Auto-scroll timeline to current time or first class
  useEffect(() => {
    const container = timelineScrollRef.current;
    if (!container) return;
    if (lastScrolledDateRef.current === selectedDateStr) return;

    const timer = setTimeout(() => {
      if (!container) return;
      let targetMin = 8 * 60; // 08:00 default
      const nowMin = now.getHours() * 60 + now.getMinutes();

      if (isToday && nowMin >= TIMELINE_START_HOUR * 60 && nowMin <= TIMELINE_END_HOUR * 60) {
        targetMin = Math.max(TIMELINE_START_HOUR * 60, nowMin - 60);
      } else if (activities.length > 0) {
        const first = parseDate(activities[0].start_time);
        targetMin = Math.max(
          TIMELINE_START_HOUR * 60,
          first.getHours() * 60 + first.getMinutes() - 30
        );
      }

      const scrollY = Math.max(0, ((targetMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT);
      if (Math.abs(container.scrollTop - scrollY) > 90) {
        container.scrollTo({ top: scrollY, behavior: 'smooth' });
      }
      lastScrolledDateRef.current = selectedDateStr;
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedDateStr, isToday, activities, now]);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const showLiveTimeLine =
    isToday && nowMin >= TIMELINE_START_HOUR * 60 && nowMin <= TIMELINE_END_HOUR * 60;
  const liveTimeTop = ((nowMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT;

  return (
    <div
      ref={timelineScrollRef}
      className="mt-3 overflow-y-auto max-h-[580px] sm:max-h-[640px] pr-1 scrollbar-thin select-none"
    >
      <div className="relative flex" style={{ height: TOTAL_TIMELINE_HEIGHT }}>
        {/* Left Column: Hours Axis (07:00..21:00) */}
        <div className="w-12 sm:w-14 shrink-0 relative select-none">
          {timelineHours.map((h, idx) => (
            <div
              key={h}
              className="absolute right-2 text-[11px] sm:text-xs font-mono font-medium text-[#86868b] -translate-y-1/2"
              style={{ top: idx * HOUR_HEIGHT }}
            >
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}

          {/* Live Current Time Badge in time axis if viewing today */}
          {showLiveTimeLine && (
            <div
              className="absolute right-1 -translate-y-1/2 z-30"
              style={{ top: liveTimeTop }}
            >
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#fa243c] text-white shadow-xs">
                {formatTime(now)}
              </span>
            </div>
          )}
        </div>

        {/* Right Canvas: Grid Lines, Classes, Gaps & Red Live Line */}
        <div className="flex-1 relative border-l border-black/[0.08] dark:border-white/[0.1] pl-2 sm:pl-3">
          {/* Horizontal Hour Lines & Half-hour Dashes */}
          {timelineHours.map((h, idx) => (
            <React.Fragment key={`grid-${h}`}>
              <div
                className="absolute left-0 right-0 border-t border-black/[0.06] dark:border-white/[0.08]"
                style={{ top: idx * HOUR_HEIGHT }}
              />
              {idx < timelineHours.length - 1 && (
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-black/[0.03] dark:border-white/[0.04]"
                  style={{ top: idx * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                />
              )}
            </React.Fragment>
          ))}

          {/* Visual Breaks / Windows ("Okienka") */}
          {dayBreaks.map((breakInfo, bIdx) => (
            <DayBreakCard
              key={`break-${breakInfo.toActId}`}
              breakInfo={breakInfo}
              now={now}
              isToday={isToday}
              bIdx={bIdx}
            />
          ))}

          {/* Proportional Class Activity Blocks */}
          {timelineItems.map((item, itemIdx) => (
            <DayActivityCard
              key={item.activity.id}
              item={item}
              now={now}
              itemIdx={itemIdx}
              onSelect={onSelectActivity}
            />
          ))}

          {/* Red Live Current Time Indicator Line */}
          {showLiveTimeLine && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-[#fa243c] z-20 pointer-events-none flex items-center shadow-xs"
              style={{ top: liveTimeTop }}
            >
              <span className="w-3 h-3 rounded-full bg-[#fa243c] -ml-1.5 ring-2 ring-white dark:ring-[#1c1c1e] shadow-xs animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#fa243c] -ml-2.5 ring-2 ring-white dark:ring-[#1c1c1e] shadow-xs" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
