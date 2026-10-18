'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { WEEK_HOUR_HEIGHT } from './week-view/types';
import { WeekNavHeader } from './week-view/WeekNavHeader';
import { WeekMobileNav } from './week-view/WeekMobileNav';
import { WeekHeader } from './week-view/WeekHeader';
import { WeekTimeScale } from './week-view/WeekTimeScale';
import { WeekDayColumn } from './week-view/WeekDayColumn';
import { useWeekKeyboardNav } from './week-view/useWeekKeyboardNav';
import { useWeekGrid } from './week-view/useWeekGrid';

interface TimetableWeekViewProps {
  activities: USOSActivity[];
  baseMonday: Date;
  showWeekend: boolean;
  onSelectActivity: (act: USOSActivity) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  isNavigatingWeek?: boolean;
}

export const TimetableWeekView: React.FC<TimetableWeekViewProps> = ({
  activities,
  baseMonday,
  showWeekend,
  onSelectActivity,
  onPrevWeek,
  onNextWeek,
  onToday,
  isNavigatingWeek = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeScrollDayIdx, setActiveScrollDayIdx] = useState<number>(0);

  useWeekKeyboardNav({ onPrevWeek, onNextWeek, onToday });

  const {
    now,
    days,
    hasTodayInWeek,
    startHour,
    hours,
    currentTimeInfo,
    weekRangeStr,
  } = useWeekGrid({ baseMonday, showWeekend });

  const activitiesByDay = useMemo(() => {
    const map: Record<string, USOSActivity[]> = {};
    for (const d of days) {
      map[d.dateStr] = [];
    }
    for (const act of activities) {
      const actDateStr = act.start_time.substring(0, 10);
      if (map[actDateStr]) {
        map[actDateStr].push(act);
      }
    }
    return map;
  }, [activities, days]);

  const scrollToDay = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const colWidth = 165;
    scrollContainerRef.current.scrollTo({
      left: idx * colWidth,
      behavior: 'smooth',
    });
    setActiveScrollDayIdx(idx);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const colWidth = 165;
    const activeIdx = Math.min(days.length - 1, Math.max(0, Math.round(scrollLeft / colWidth)));
    setActiveScrollDayIdx(activeIdx);
  };

  useEffect(() => {
    const todayIdx = days.findIndex((d) => d.isToday);
    if (todayIdx > 0 && typeof window !== 'undefined' && window.innerWidth < 640) {
      setActiveScrollDayIdx(todayIdx);
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          const colWidth = 165;
          scrollContainerRef.current.scrollTo({
            left: Math.max(0, (todayIdx - 0.5) * colWidth),
            behavior: 'smooth',
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [baseMonday, days]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <WeekNavHeader
        weekRangeStr={weekRangeStr}
        isNavigatingWeek={isNavigatingWeek}
        hasTodayInWeek={hasTodayInWeek}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        onToday={onToday}
      />

      {/* Main Week Grid Card */}
      <div className="w-full apple-card rounded-3xl overflow-hidden flex flex-col shadow-xs relative">
        {isNavigatingWeek && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] overflow-hidden rounded-t-3xl z-40">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#fa243c] to-transparent animate-pulse" />
          </div>
        )}

        <WeekMobileNav
          days={days}
          activeScrollDayIdx={activeScrollDayIdx}
          activitiesByDay={activitiesByDay}
          onSelectDay={scrollToDay}
        />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto touch-momentum relative scrollbar-none"
        >
          <div style={{ minWidth: `calc(48px + ${days.length} * 165px)` }} className="w-full">
            <WeekHeader
              days={days}
              currentTimeInfo={currentTimeInfo}
              onSelectDay={scrollToDay}
            />

            <div
              className="grid relative"
              style={{
                gridTemplateColumns: `48px repeat(${days.length}, minmax(165px, 1fr))`,
                height: `${hours.length * WEEK_HOUR_HEIGHT}px`,
              }}
            >
              <WeekTimeScale
                hours={hours}
                hasTodayInWeek={hasTodayInWeek}
                currentTimeInfo={currentTimeInfo}
              />

              {days.map((day) => (
                <WeekDayColumn
                  key={day.offset}
                  day={day}
                  hours={hours}
                  activities={activitiesByDay[day.dateStr] || []}
                  hasTodayInWeek={hasTodayInWeek}
                  currentTimeInfo={currentTimeInfo}
                  startHour={startHour}
                  now={now}
                  onSelectActivity={onSelectActivity}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
