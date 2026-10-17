'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { WEEK_HOUR_HEIGHT, WeekDayItem, CurrentTimeInfo } from './week-view/types';
import { WeekMobileNav } from './week-view/WeekMobileNav';
import { WeekHeader } from './week-view/WeekHeader';
import { WeekActivityCard } from './week-view/WeekActivityCard';

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
  const [now, setNow] = useState<Date>(() => new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeScrollDayIdx, setActiveScrollDayIdx] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation on computer (Left/Right arrows for week switching, T for today)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevWeek?.();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNextWeek?.();
      } else if (e.key === 't' || e.key === 'T' || e.key === 'Home') {
        e.preventDefault();
        onToday?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevWeek, onNextWeek, onToday]);

  const days = useMemo<WeekDayItem[]>(() => {
    const list = [
      { name: 'Poniedziałek', short: 'Pon', offset: 0 },
      { name: 'Wtorek', short: 'Wt', offset: 1 },
      { name: 'Środa', short: 'Śr', offset: 2 },
      { name: 'Czwartek', short: 'Czw', offset: 3 },
      { name: 'Piątek', short: 'Pt', offset: 4 },
    ];
    if (showWeekend) {
      list.push(
        { name: 'Sobota', short: 'Sob', offset: 5 },
        { name: 'Niedziela', short: 'Ndz', offset: 6 }
      );
    }

    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    return list.map((item) => {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + item.offset);
      const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const isToday = dateStr === todayStr;

      return {
        ...item,
        date: d,
        dateStr,
        dayNum: d.getDate(),
        monthShort: d.toLocaleDateString('pl-PL', { month: 'short' }),
        isToday,
      };
    });
  }, [baseMonday, showWeekend, now]);

  const hasTodayInWeek = useMemo(() => days.some((d) => d.isToday), [days]);

  const { startHour, endHour, hours } = useMemo(() => {
    let start = 8;
    let end = 21;

    if (hasTodayInWeek) {
      const curH = now.getHours();
      if (curH >= 6 && curH < 8) start = curH;
      if (curH >= 21) end = Math.min(23, curH);
    }

    const arr: number[] = [];
    for (let h = start; h <= end; h++) {
      arr.push(h);
    }
    return { startHour: start, endHour: end, hours: arr };
  }, [hasTodayInWeek, now]);

  const currentTimeInfo = useMemo<CurrentTimeInfo>(() => {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const top = (currentHour - startHour + currentMin / 60) * WEEK_HOUR_HEIGHT;
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    const inGrid = currentHour >= startHour && currentHour <= endHour;

    return {
      top,
      timeString,
      inGrid,
    };
  }, [now, startHour, endHour]);

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

  // Week range label: e.g. "12.10.2026 – 18.10.2026"
  const sunday = new Date(baseMonday);
  sunday.setDate(baseMonday.getDate() + (showWeekend ? 6 : 4));
  const weekRangeStr = `${baseMonday.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
  })} – ${sunday.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}`;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Week Navigation Header */}
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

      {/* Main Week Grid Card */}
      <div className="w-full apple-card rounded-3xl overflow-hidden flex flex-col shadow-xs relative">
        {isNavigatingWeek && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] overflow-hidden rounded-t-3xl z-40">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#fa243c] to-transparent animate-pulse" />
          </div>
        )}

        {/* Mobile day selector buttons */}
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
            {/* Sticky Header with Day Names and Numbers */}
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
              {/* Left Hours Scale */}
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

              {/* Days Columns */}
              {days.map((day) => {
                const dayActs = activitiesByDay[day.dateStr] || [];

                return (
                  <div
                    key={day.offset}
                    className={`relative border-r last:border-r-0 border-black/[0.04] dark:border-white/[0.06] transition-colors ${
                      day.isToday ? 'bg-[#fa243c]/[0.02] dark:bg-[#fa243c]/[0.04]' : ''
                    }`}
                  >
                    {/* Hourly horizontal lines */}
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
                    {dayActs.map((act) => (
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
