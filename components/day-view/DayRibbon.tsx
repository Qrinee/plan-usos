'use client';

import React, { useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayItem, WeekDaysGroup } from './types';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Auto-center ribbon so the current week (offset 0) is displayed
  const centerActiveWeek = useCallback((smooth = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetLeft = container.clientWidth;
    if (targetLeft <= 0) {
      requestAnimationFrame(() => {
        if (container && container.clientWidth > 0) {
          container.scrollLeft = container.clientWidth;
        }
      });
      return;
    }

    isProgrammaticScrollRef.current = true;
    if (!smooth) {
      container.style.scrollSnapType = 'none';
      container.scrollLeft = targetLeft;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (container) {
            container.style.scrollSnapType = 'x mandatory';
          }
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
            isNavigatingRef.current = false;
          }, 50);
        });
      });
    } else {
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        isNavigatingRef.current = false;
      }, 350);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    centerActiveWeek(false);
  }, [baseMonday, centerActiveWeek]);

  useEffect(() => {
    const handleResize = () => centerActiveWeek(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerActiveWeek]);

  // Magnetic snap week transition when ribbon is scrolled to left or right
  const handleWeekScroll = () => {
    if (isProgrammaticScrollRef.current || isNavigatingRef.current || isNavigatingWeek) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    if (width <= 0) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (isProgrammaticScrollRef.current || isNavigatingRef.current || isNavigatingWeek) return;

      const scrollLeft = container.scrollLeft;
      const pageIndex = Math.round(scrollLeft / width);

      if (pageIndex === 0) {
        isNavigatingRef.current = true;
        const prevMonday = new Date(baseMonday);
        prevMonday.setDate(baseMonday.getDate() - 7);

        if (onNavigateToMonday) {
          onNavigateToMonday(prevMonday);
        } else if (onPrevWeek) {
          onPrevWeek();
        }

        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 800);
      } else if (pageIndex === 2) {
        isNavigatingRef.current = true;
        const nextMonday = new Date(baseMonday);
        nextMonday.setDate(baseMonday.getDate() + 7);

        if (onNavigateToMonday) {
          onNavigateToMonday(nextMonday);
        } else if (onNextWeek) {
          onNextWeek();
        }

        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 800);
      }
    }, 60);
  };

  // Mouse drag-to-scroll support for desktop
  const isMouseDownRef = useRef(false);
  const startMouseXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startMouseXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const deltaX = e.clientX - startMouseXRef.current;
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
      container.style.scrollSnapType = 'none';
      container.scrollLeft = startScrollLeftRef.current - deltaX;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const container = scrollContainerRef.current;
    if (!container) return;

    if (hasDraggedRef.current) {
      container.style.scrollSnapType = 'x mandatory';
      const width = container.clientWidth;
      const pageIndex = Math.round(container.scrollLeft / width);
      container.scrollTo({ left: pageIndex * width, behavior: 'smooth' });
    }
  };

  const hasTodayInCurrentWeek = weeksList.find((w) => w.offset === 0)?.days.some((d) => d.isToday);

  return (
    <>
      {/* Week Info Header & Quick Week Arrows */}
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

        <div className="flex items-center space-x-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] p-0.5">
          <button
            onClick={onPrevWeek}
            disabled={isNavigatingWeek}
            className="w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
            title="Poprzedni tydzień"
            aria-label="Poprzedni tydzień"
          >
            <ChevronLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
          {onToday && !hasTodayInCurrentWeek && (
            <button
              onClick={onToday}
              disabled={isNavigatingWeek}
              className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full cursor-pointer transition-all active:scale-95 text-[#fa243c] hover:bg-[#fa243c]/10"
              title="Wróć do bieżącego tygodnia"
            >
              Dziś
            </button>
          )}
          <button
            onClick={onNextWeek}
            disabled={isNavigatingWeek}
            className="w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
            title="Następny tydzień"
            aria-label="Następny tydzień"
          >
            <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

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
              {week.days.map((day) => {
                const isSelected = selectedDateStr === day.dateStr;
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      onSelectDay(day);
                    }}
                    className={`flex flex-col items-center justify-between h-[66px] sm:h-[72px] w-full p-1.5 sm:p-2 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-md shadow-[#fa243c]/25 font-semibold scale-[1.02]'
                        : 'apple-card text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                    }`}
                  >
                    <div className="flex items-center space-x-1 text-[11px] sm:text-xs">
                      <span>{day.short}</span>
                      {day.isToday && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#fa243c] animate-pulse'
                          }`}
                        />
                      )}
                    </div>

                    <span className="text-base sm:text-lg font-bold leading-none">{day.dayNum}</span>

                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium truncate max-w-full text-center leading-none ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b]'
                      }`}
                    >
                      {day.weekOffset === 0
                        ? day.count === 0
                          ? 'brak'
                          : `${day.count} ${day.count === 1 ? 'zaj.' : 'zajęć'}`
                        : day.count > 0
                          ? `${day.count} zaj.`
                          : day.weekOffset < 0
                            ? 'Poprz.'
                            : 'Nast.'}
                    </span>

                    {/* Active tab underline */}
                    {isSelected && (
                      <span className="absolute bottom-1 w-6 h-[2.5px] rounded-full bg-white shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
