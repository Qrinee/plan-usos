'use client';

import React from 'react';
import { DayItem, WeekDaysGroup } from './types';
import { DayRibbonHeader } from './DayRibbonHeader';
import { DayTabButton } from './DayTabButton';
import { useRibbonScroll } from './useRibbonScroll';

interface DayRibbonProps {
  weeksList: WeekDaysGroup[];
  selectedDateStr: string;
  showWeekend: boolean;
  weekRangeStr: string;
  isNavigatingWeek: boolean;
  baseMonday: Date;
  onSelectDay: (day: DayItem) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  onNavigateToMonday?: (monday: Date) => void;
}

export const DayRibbon: React.FC<DayRibbonProps> = ({
  weeksList,
  selectedDateStr,
  showWeekend,
  weekRangeStr,
  isNavigatingWeek,
  baseMonday,
  onSelectDay,
  onPrevWeek,
  onNextWeek,
  onToday,
  onNavigateToMonday,
}) => {
  const {
    scrollContainerRef,
    hasDraggedRef,
    handleWeekScroll,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  } = useRibbonScroll({
    baseMonday,
    isNavigatingWeek,
    onNavigateToMonday,
    onPrevWeek,
    onNextWeek,
  });

  const hasTodayInCurrentWeek = weeksList.find((w) => w.offset === 0)?.days.some((d) => d.isToday);

  return (
    <>
      <DayRibbonHeader
        weekRangeStr={weekRangeStr}
        isNavigatingWeek={isNavigatingWeek}
        hasTodayInCurrentWeek={hasTodayInCurrentWeek}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        onToday={onToday}
      />

      {/* Swipeable Day Tabs Ribbon */}
      <div
        ref={scrollContainerRef}
        onScroll={handleWeekScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="w-full overflow-x-auto scrollbar-none snap-x snap-mandatory flex touch-pan-x py-0.5 select-none cursor-grab active:cursor-grabbing"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {weeksList.map((week) => (
          <div
            key={week.offset}
            data-week-offset={week.offset}
            className="w-full min-w-full shrink-0 snap-center snap-always px-0.5"
          >
            <div
              className={`grid ${
                showWeekend ? 'grid-cols-7' : 'grid-cols-5'
              } gap-1.5 sm:gap-2 w-full select-none`}
            >
              {week.days.map((day) => (
                <DayTabButton
                  key={day.dateStr}
                  day={day}
                  isSelected={selectedDateStr === day.dateStr}
                  onClick={() => {
                    if (hasDraggedRef.current) return;
                    onSelectDay(day);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
