'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { formatTime } from '@/lib/utils/date';
import { ViewMode } from '@/components/TimetableControls';
import { DayItem, WeekDaysGroup } from './day-view/types';
import { DayRibbon } from './day-view/DayRibbon';
import { DayTimeline } from './day-view/DayTimeline';

interface TimetableDayViewProps {
  activities: USOSActivity[];
  baseMonday: Date;
  showWeekend: boolean;
  onSelectActivity: (act: USOSActivity) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  onNavigateToMonday?: (monday: Date) => void;
  isNavigatingWeek?: boolean;
  onSwitchViewMode?: (mode: ViewMode) => void;
  slideDirection?: 'right' | 'left' | 'fade';
  transitionKey?: number;
}

export const TimetableDayView: React.FC<TimetableDayViewProps> = ({
  activities,
  baseMonday,
  showWeekend,
  onSelectActivity,
  onPrevWeek,
  onNextWeek,
  onToday,
  onNavigateToMonday,
  isNavigatingWeek = false,
  slideDirection,
  transitionKey,
}) => {
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  const dayOffsets = useMemo(() => {
    const list = [
      { name: 'Poniedziałek', short: 'Pon', dayIndex: 0 },
      { name: 'Wtorek', short: 'Wt', dayIndex: 1 },
      { name: 'Środa', short: 'Śr', dayIndex: 2 },
      { name: 'Czwartek', short: 'Czw', dayIndex: 3 },
      { name: 'Piątek', short: 'Pt', dayIndex: 4 },
    ];
    if (showWeekend) {
      list.push(
        { name: 'Sobota', short: 'Sob', dayIndex: 5 },
        { name: 'Niedziela', short: 'Ndz', dayIndex: 6 }
      );
    }
    return list;
  }, [showWeekend]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  // Multi-week structure for continuous ribbon scrolling (-1, 0, +1)
  const weeksList = useMemo<WeekDaysGroup[]>(() => {
    return [-1, 0, 1].map((offset) => {
      const weekMonday = new Date(baseMonday);
      weekMonday.setDate(baseMonday.getDate() + offset * 7);

      const days: DayItem[] = dayOffsets.map((item) => {
        const d = new Date(weekMonday);
        d.setDate(weekMonday.getDate() + item.dayIndex);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const isToday = dateStr === todayStr;

        const count = activities.filter((act) => act.start_time.startsWith(dateStr)).length;

        return {
          ...item,
          date: d,
          dateStr,
          dayNum: d.getDate(),
          isToday,
          count,
          weekOffset: offset,
          weekMonday,
        };
      });

      return {
        offset,
        weekMonday,
        days,
      };
    });
  }, [baseMonday, dayOffsets, activities, todayStr]);

  const currentWeekDays = useMemo(() => {
    return weeksList.find((w) => w.offset === 0)?.days || [];
  }, [weeksList]);

  const allDays = useMemo(() => {
    return weeksList.flatMap((w) => w.days);
  }, [weeksList]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const todayDay = currentWeekDays.find((d) => d.isToday);
    return todayDay ? todayDay.dateStr : currentWeekDays[0]?.dateStr || '';
  });

  const prevBaseMondayRef = useRef<number>(baseMonday.getTime());
  const [weekSlideAnim, setWeekSlideAnim] = useState<string>('');
  const [weekAnimKey, setWeekAnimKey] = useState<number>(0);
  const [daySlideAnim, setDaySlideAnim] = useState<string>('');
  const [weekBadge, setWeekBadge] = useState<{ title: string; detail: string; isNext: boolean } | null>(null);

  // Card & hint refs for smooth 60/120fps touch drag feedback
  const cardRef = useRef<HTMLDivElement>(null);
  const hintRightRef = useRef<HTMLDivElement>(null);
  const hintLeftRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasHorizontalIntentRef = useRef<boolean | null>(null);

  // Detect week changes (from swiping, week buttons, or ribbon scrolling)
  useIsomorphicLayoutEffect(() => {
    if (baseMonday.getTime() !== prevBaseMondayRef.current) {
      const isMovingForward = baseMonday.getTime() > prevBaseMondayRef.current;
      prevBaseMondayRef.current = baseMonday.getTime();

      const prevDate = new Date(selectedDateStr);
      const prevDayOfWeek = prevDate.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
      const wasFridayOrWeekend = prevDayOfWeek === 5 || prevDayOfWeek === 6 || prevDayOfWeek === 0;

      let targetDay: DayItem | undefined;
      if (isMovingForward || wasFridayOrWeekend) {
        targetDay = currentWeekDays[0]; // Always Monday for new week!
      } else {
        let dayIndex = (prevDayOfWeek + 6) % 7;
        if (dayIndex >= currentWeekDays.length || isNaN(dayIndex)) {
          dayIndex = currentWeekDays.length - 1;
        }
        targetDay = currentWeekDays[dayIndex] || currentWeekDays[0];
      }

      if (targetDay) {
        setSelectedDateStr(targetDay.dateStr);
      }

      // Animate the whole view
      const animClass = isMovingForward ? 'anim-week-slide-right' : 'anim-week-slide-left';
      setWeekSlideAnim(animClass);
      setWeekAnimKey((k) => k + 1);

      // Display floating Apple-style week transition notification badge
      const endDay = new Date(baseMonday);
      endDay.setDate(baseMonday.getDate() + (showWeekend ? 6 : 4));
      const rangeText = `${baseMonday.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} – ${endDay.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`;

      setWeekBadge({
        title: isMovingForward ? 'Następny tydzień' : 'Poprzedni tydzień',
        detail: `${targetDay?.name || 'Poniedziałek'}, ${rangeText}`,
        isNext: isMovingForward,
      });

      const timer = setTimeout(() => {
        setWeekBadge(null);
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, [baseMonday, currentWeekDays, selectedDateStr, showWeekend]);

  const activeDay = allDays.find((d) => d.dateStr === selectedDateStr) || currentWeekDays[0];

  const handleDaySelect = (day: DayItem) => {
    setSelectedDateStr(day.dateStr);
    if (day.weekOffset !== 0) {
      if (onNavigateToMonday) {
        onNavigateToMonday(day.weekMonday);
      } else if (day.weekOffset > 0 && onNextWeek) {
        onNextWeek();
      } else if (day.weekOffset < 0 && onPrevWeek) {
        onPrevWeek();
      }
    }
  };

  // Clock tick for live status
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const activeDayActivities = useMemo(() => {
    return activities
      .filter((act) => act.start_time.substring(0, 10) === selectedDateStr)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [activities, selectedDateStr]);

  // Touch swipe handling for day switching
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToNextDay = () => {
    const curIdx = currentWeekDays.findIndex((d) => d.dateStr === selectedDateStr);
    if (curIdx >= 0 && curIdx < currentWeekDays.length - 1) {
      setDaySlideAnim('anim-day-slide-right');
      setSelectedDateStr(currentWeekDays[curIdx + 1].dateStr);
    } else {
      // Swiping left on Friday / last day -> Next week (Monday)!
      const nextMonday = new Date(baseMonday);
      nextMonday.setDate(baseMonday.getDate() + 7);
      const nextMondayStr = `${nextMonday.getFullYear()}-${(nextMonday.getMonth() + 1).toString().padStart(2, '0')}-${nextMonday.getDate().toString().padStart(2, '0')}`;
      setSelectedDateStr(nextMondayStr);
      setWeekSlideAnim('anim-week-slide-right');
      setWeekAnimKey((k) => k + 1);
      if (onNavigateToMonday) {
        onNavigateToMonday(nextMonday);
      } else if (onNextWeek) {
        onNextWeek();
      }
    }
  };

  const goToPrevDay = () => {
    const curIdx = currentWeekDays.findIndex((d) => d.dateStr === selectedDateStr);
    if (curIdx > 0) {
      setDaySlideAnim('anim-day-slide-left');
      setSelectedDateStr(currentWeekDays[curIdx - 1].dateStr);
    } else {
      // Swiping right on Monday -> Prev week (Friday)!
      const prevMonday = new Date(baseMonday);
      prevMonday.setDate(baseMonday.getDate() - 7);
      const lastDayOffset = showWeekend ? 6 : 4;
      const targetPrevDate = new Date(prevMonday);
      targetPrevDate.setDate(prevMonday.getDate() + lastDayOffset);
      const targetPrevDateStr = `${targetPrevDate.getFullYear()}-${(targetPrevDate.getMonth() + 1).toString().padStart(2, '0')}-${targetPrevDate.getDate().toString().padStart(2, '0')}`;
      setSelectedDateStr(targetPrevDateStr);
      setWeekSlideAnim('anim-week-slide-left');
      setWeekAnimKey((k) => k + 1);
      if (onNavigateToMonday) {
        onNavigateToMonday(prevMonday);
      } else if (onPrevWeek) {
        onPrevWeek();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    hasHorizontalIntentRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    if (hasHorizontalIntentRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        hasHorizontalIntentRef.current = Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
      }
    }

    if (!hasHorizontalIntentRef.current) return;

    // Dampen drag translation for smooth tactile response
    const damp = 0.35;
    const translateX = Math.max(-85, Math.min(85, deltaX * damp));
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;
      cardRef.current.style.transition = 'none';
    }

    // Show edge preview hint
    if (deltaX < -20) {
      const progress = Math.min(1, (Math.abs(deltaX) - 20) / 40);
      if (hintRightRef.current) {
        hintRightRef.current.style.opacity = progress.toString();
        hintRightRef.current.style.transform = `translate3d(0, -50%, 0) scale(${0.85 + progress * 0.15})`;
      }
      if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';
    } else if (deltaX > 20) {
      const progress = Math.min(1, (deltaX - 20) / 40);
      if (hintLeftRef.current) {
        hintLeftRef.current.style.opacity = progress.toString();
        hintLeftRef.current.style.transform = `translate3d(0, -50%, 0) scale(${0.85 + progress * 0.15})`;
      }
      if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
    } else {
      if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
      if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || touchStartX.current === null) return;
    isDraggingRef.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const wasHorizontal = hasHorizontalIntentRef.current;
    touchStartX.current = null;
    touchStartY.current = null;
    hasHorizontalIntentRef.current = null;

    if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
    if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)';
      cardRef.current.style.transform = 'translate3d(0, 0, 0)';
    }

    if (wasHorizontal && Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        goToNextDay();
      } else {
        goToPrevDay();
      }
    }
  };

  const handleTouchCancel = () => {
    isDraggingRef.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    hasHorizontalIntentRef.current = null;
    if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
    if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)';
      cardRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

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

  const curDayIndex = currentWeekDays.findIndex((d) => d.dateStr === selectedDateStr);
  const isFridayOrLast = curDayIndex === currentWeekDays.length - 1;
  const isMondayFirst = curDayIndex === 0;
  const nextDayName = curDayIndex >= 0 && curDayIndex < currentWeekDays.length - 1 ? currentWeekDays[curDayIndex + 1]?.name : null;
  const prevDayName = curDayIndex > 0 ? currentWeekDays[curDayIndex - 1]?.name : null;

  return (
    <div
      key={`week-wrapper-${weekAnimKey}`}
      className={`space-y-3 sm:space-y-4 relative ${weekSlideAnim}`}
      onAnimationEnd={() => setWeekSlideAnim('')}
    >

      {/* Week Header & Day Ribbon */}
      <DayRibbon
        weeksList={weeksList}
        selectedDateStr={selectedDateStr}
        showWeekend={showWeekend}
        weekRangeStr={weekRangeStr}
        isNavigatingWeek={isNavigatingWeek}
        baseMonday={baseMonday}
        onSelectDay={handleDaySelect}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        onToday={onToday}
        onNavigateToMonday={onNavigateToMonday}
      />

      {/* Active Day Content Card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className="apple-card rounded-3xl p-3 sm:p-5 min-h-[520px] sm:min-h-[600px] relative transition-shadow duration-300 overflow-hidden"
      >
        {/* Edge Swipe Preview Hints */}
        <div
          ref={hintRightRef}
          style={{ opacity: 0 }}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-opacity duration-150"
        >
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-xl shadow-[#fa243c]/40 text-xs font-semibold backdrop-blur-md border border-white/20">
            <span>
              {isFridayOrLast ? 'Następny tydzień (Pon)' : nextDayName || 'Dalej'}
            </span>
            <ArrowRight className="w-4 h-4 animate-pulse shrink-0" />
          </div>
        </div>

        <div
          ref={hintLeftRef}
          style={{ opacity: 0 }}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-opacity duration-150"
        >
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-xl shadow-[#fa243c]/40 text-xs font-semibold backdrop-blur-md border border-white/20">
            <ArrowLeft className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              {isMondayFirst ? 'Poprzedni tydzień (Pt)' : prevDayName || 'Wstecz'}
            </span>
          </div>
        </div>
        {isNavigatingWeek && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] overflow-hidden rounded-t-3xl z-30">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#fa243c] to-transparent animate-pulse" />
          </div>
        )}

        {/* Day Card Header with full date & today indicator */}
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
              {activeDayActivities.length === 0
                ? 'Dzień wolny od zajęć dydaktycznych'
                : `${activeDayActivities.length} ${activeDayActivities.length === 1 ? 'zajęcia' : 'zajęć'
                } zaplanowanych`}
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#fa243c] animate-ping shrink-0" />
                <span>Dziś • {formatTime(now)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skeleton loading overlay when week is actively fetching */}
        {isNavigatingWeek && (
          <div className="absolute inset-0 z-30 bg-white/70 dark:bg-black/70 backdrop-blur-xs rounded-3xl flex flex-col justify-start pt-16 px-6 space-y-4 anim-filter-fade pointer-events-none">
            <div className="h-20 w-full rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] animate-pulse" />
            <div className="h-28 w-full rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] animate-pulse delay-75" />
            <div className="h-24 w-full rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] animate-pulse delay-150" />
          </div>
        )}

        {/* Content Container */}
        <div
          key={`day-content-${selectedDateStr}`}
          className={daySlideAnim || 'anim-timeline-enter'}
          onAnimationEnd={() => setDaySlideAnim('')}
        >
          {activeDayActivities.length === 0 ? (
            <div className="py-20 text-center text-[#86868b] flex flex-col items-center justify-center min-h-[340px]">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-[#86868b]/40" />
              <p className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Wolne od zajęć
              </p>
              <p className="text-xs mt-1 text-[#86868b] max-w-xs">
                Brak zaplanowanych ćwiczeń, laboratoriów ani wykładów w tym dniu.
              </p>
            </div>
          ) : (
            <DayTimeline
              activities={activeDayActivities}
              isToday={Boolean(activeDay?.isToday)}
              now={now}
              selectedDateStr={selectedDateStr}
              onSelectActivity={onSelectActivity}
            />
          )}
        </div>
      </div>
    </div>
  );
};
