'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { ViewMode } from '@/components/TimetableControls';
import { DayRibbon } from './day-view/DayRibbon';
import { DayTimeline } from './day-view/DayTimeline';
import { DayViewHeader } from './day-view/DayViewHeader';
import { DayViewEmptyState } from './day-view/DayViewEmptyState';
import { useDayViewNavigation } from './day-view/useDayViewNavigation';
import { useDaySwipeGestures } from './day-view/useDaySwipeGestures';

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
}) => {
  const {
    weeksList,
    currentWeekDays,
    selectedDateStr,
    setSelectedDateStr,
    activeDay,
    handleDaySelect,
    weekRangeStr,
    weekSlideAnim,
    setWeekSlideAnim,
    weekAnimKey,
    setWeekAnimKey,
  } = useDayViewNavigation({
    activities,
    baseMonday,
    showWeekend,
    onNavigateToMonday,
    onPrevWeek,
    onNextWeek,
  });

  const {
    cardRef,
    hintRightRef,
    hintLeftRef,
    daySlideAnim,
    setDaySlideAnim,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = useDaySwipeGestures({
    currentWeekDays,
    selectedDateStr,
    setSelectedDateStr,
    baseMonday,
    showWeekend,
    onNavigateToMonday,
    onPrevWeek,
    onNextWeek,
    setWeekSlideAnim,
    setWeekAnimKey,
  });

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

        <DayViewHeader
          activeDay={activeDay}
          activityCount={activeDayActivities.length}
          isNavigatingWeek={isNavigatingWeek}
          now={now}
        />

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
            <DayViewEmptyState />
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
