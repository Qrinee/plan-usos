'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import {
  MapPin,
  User,
  CheckCircle,
  Coffee,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate, formatTime } from '@/lib/utils/date';
import { analyzeCampusTransit, TransitAnalysis } from '@/lib/utils/transit';
import { ViewMode } from '@/components/TimetableControls';

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
}

interface TimetableBreak {
  toActId: string;
  fromAct: USOSActivity;
  toAct: USOSActivity;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  isWindow: boolean;
  transit: TransitAnalysis | null;
}

interface TimelineLayoutItem {
  activity: USOSActivity;
  start: Date;
  end: Date;
  startMin: number;
  endMin: number;
  topPx: number;
  heightPx: number;
  colIndex: number;
  totalCols: number;
}

const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 21;
const HOUR_HEIGHT = 80;
const TOTAL_TIMELINE_HEIGHT = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * HOUR_HEIGHT;

function formatBreakDuration(minutes: number): { short: string; full: string } {
  if (minutes < 60) {
    return {
      short: `${minutes} min`,
      full: `${minutes} min przerwy`,
    };
  }
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;

  let hoursStr = `${hours} godz.`;
  if (hours === 1) hoursStr = '1 godzina';
  else if (hours >= 2 && hours <= 4) hoursStr = `${hours} godziny`;
  else hoursStr = `${hours} godzin`;

  if (remMins === 0) {
    return {
      short: `${hours}h`,
      full: `${hoursStr} przerwy`,
    };
  }
  return {
    short: `${hours}h ${remMins} min`,
    full: `${hours}h ${remMins} min przerwy`,
  };
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
  onSwitchViewMode,
}) => {
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

  const weeksList = useMemo(() => {
    return [-1, 0, 1].map((offset) => {
      const weekMonday = new Date(baseMonday);
      weekMonday.setDate(baseMonday.getDate() + offset * 7);

      const days = dayOffsets.map((item) => {
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

  type DayItem = (typeof allDays)[0];

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const todayDay = currentWeekDays.find((d) => d.isToday);
    return todayDay ? todayDay.dateStr : currentWeekDays[0]?.dateStr || '';
  });

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  const prevBaseMondayRef = useRef<number>(baseMonday.getTime());

  // Ensure advancing forward or moving from Friday/weekend starts on Monday of the new week
  useIsomorphicLayoutEffect(() => {
    const existsInCurrentWeek = currentWeekDays.some((d) => d.dateStr === selectedDateStr);
    if (!existsInCurrentWeek && currentWeekDays.length > 0) {
      const isMovingForward = baseMonday.getTime() > prevBaseMondayRef.current;
      prevBaseMondayRef.current = baseMonday.getTime();

      const prevDate = new Date(selectedDateStr);
      const prevDayOfWeek = prevDate.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
      const wasFridayOrWeekend = prevDayOfWeek === 5 || prevDayOfWeek === 6 || prevDayOfWeek === 0;

      let targetDay: (typeof currentWeekDays)[0];
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
    } else {
      prevBaseMondayRef.current = baseMonday.getTime();
    }
  }, [baseMonday, currentWeekDays, selectedDateStr]);

  const activeDay = allDays.find((d) => d.dateStr === selectedDateStr) || currentWeekDays[0];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-center ribbon so current week (offset 0) is displayed
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

  // Handle horizontal scroll & magnetic snap on the day blocks ribbon
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

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const activeDayActivities = useMemo(() => {
    return activities
      .filter((act) => act.start_time.substring(0, 10) === selectedDateStr)
      .sort((a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime());
  }, [activities, selectedDateStr]);

  const activitiesToDisplay = activeDayActivities;

  // Compute breaks between classes for the active day
  const dayBreaks = useMemo(() => {
    if (activitiesToDisplay.length < 2) return [];

    const breaks: TimetableBreak[] = [];
    let maxEndMs = parseDate(activitiesToDisplay[0].end_time).getTime();
    let prevActForBreak = activitiesToDisplay[0];
    let lastBreakEndMs = -1;

    for (let i = 1; i < activitiesToDisplay.length; i++) {
      const act = activitiesToDisplay[i];
      const startMs = parseDate(act.start_time).getTime();
      const endMs = parseDate(act.end_time).getTime();

      const diffMs = startMs - maxEndMs;
      const durationMinutes = Math.round(diffMs / (1000 * 60));

      if (durationMinutes > 0 && startMs !== lastBreakEndMs) {
        const breakStart = new Date(maxEndMs);
        const breakEnd = new Date(startMs);
        const transit = analyzeCampusTransit(prevActForBreak, act);

        breaks.push({
          toActId: act.id,
          fromAct: prevActForBreak,
          toAct: act,
          startTime: breakStart,
          endTime: breakEnd,
          durationMinutes,
          isWindow: durationMinutes >= 45,
          transit,
        });
        lastBreakEndMs = startMs;
      }

      if (endMs > maxEndMs) {
        maxEndMs = endMs;
        prevActForBreak = act;
      }
    }

    return breaks;
  }, [activitiesToDisplay]);

  const breaksMap = useMemo(() => {
    const map = new Map<string, TimetableBreak>();
    for (const b of dayBreaks) {
      map.set(b.toActId, b);
    }
    return map;
  }, [dayBreaks]);

  // Compute timeline layout with smart overlapping event clusters
  const timelineItems = useMemo<TimelineLayoutItem[]>(() => {
    if (activitiesToDisplay.length === 0) return [];

    const items = activitiesToDisplay.map((act) => {
      const start = parseDate(act.start_time);
      const end = parseDate(act.end_time);
      const startMin = start.getHours() * 60 + start.getMinutes();
      const endMin = end.getHours() * 60 + end.getMinutes();
      const topPx = Math.max(0, ((startMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT);
      const heightPx = Math.max(48, ((endMin - startMin) / 60) * HOUR_HEIGHT);
      return {
        activity: act,
        start,
        end,
        startMin,
        endMin,
        topPx,
        heightPx,
        colIndex: 0,
        totalCols: 1,
      };
    });

    items.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

    const clusters: TimelineLayoutItem[][] = [];
    let currentCluster: TimelineLayoutItem[] = [];
    let clusterEndMin = 0;

    for (const item of items) {
      if (currentCluster.length === 0) {
        currentCluster.push(item);
        clusterEndMin = item.endMin;
      } else if (item.startMin < clusterEndMin) {
        currentCluster.push(item);
        clusterEndMin = Math.max(clusterEndMin, item.endMin);
      } else {
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterEndMin = item.endMin;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    for (const cluster of clusters) {
      const columns: number[] = [];
      for (const item of cluster) {
        let placed = false;
        for (let c = 0; c < columns.length; c++) {
          if (columns[c] <= item.startMin) {
            item.colIndex = c;
            columns[c] = item.endMin;
            placed = true;
            break;
          }
        }
        if (!placed) {
          item.colIndex = columns.length;
          columns.push(item.endMin);
        }
      }
      const totalCols = Math.max(1, columns.length);
      for (const item of cluster) {
        item.totalCols = totalCols;
      }
    }

    return items;
  }, [activitiesToDisplay]);

  // Auto-scroll timeline to current time or first class without jitter
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const lastScrolledDateRef = useRef<string>('');

  useEffect(() => {
    const container = timelineScrollRef.current;
    if (!container) return;
    if (lastScrolledDateRef.current === selectedDateStr) return;

    const timer = setTimeout(() => {
      if (!container) return;
      let targetMin = 8 * 60; // 08:00 default
      const nowMin = now.getHours() * 60 + now.getMinutes();

      if (activeDay?.isToday && nowMin >= TIMELINE_START_HOUR * 60 && nowMin <= TIMELINE_END_HOUR * 60) {
        targetMin = Math.max(TIMELINE_START_HOUR * 60, nowMin - 60);
      } else if (activitiesToDisplay.length > 0) {
        const first = parseDate(activitiesToDisplay[0].start_time);
        targetMin = Math.max(TIMELINE_START_HOUR * 60, first.getHours() * 60 + first.getMinutes() - 30);
      }

      const scrollY = Math.max(0, ((targetMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT);
      if (Math.abs(container.scrollTop - scrollY) > 90) {
        container.scrollTo({ top: scrollY, behavior: 'smooth' });
      }
      lastScrolledDateRef.current = selectedDateStr;
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedDateStr, activeDay?.isToday, activitiesToDisplay]);

  // Touch swipe handling for flipping days
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToNextDay = () => {
    const curIdx = currentWeekDays.findIndex((d) => d.dateStr === selectedDateStr);
    if (curIdx >= 0 && curIdx < currentWeekDays.length - 1) {
      setSelectedDateStr(currentWeekDays[curIdx + 1].dateStr);
    } else {
      const nextMonday = new Date(baseMonday);
      nextMonday.setDate(baseMonday.getDate() + 7);
      const nextMondayStr = `${nextMonday.getFullYear()}-${(nextMonday.getMonth() + 1).toString().padStart(2, '0')}-${nextMonday.getDate().toString().padStart(2, '0')}`;
      setSelectedDateStr(nextMondayStr);
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
      setSelectedDateStr(currentWeekDays[curIdx - 1].dateStr);
    } else {
      const prevMonday = new Date(baseMonday);
      prevMonday.setDate(baseMonday.getDate() - 7);
      const lastDayOffset = showWeekend ? 6 : 4;
      const targetPrevDate = new Date(prevMonday);
      targetPrevDate.setDate(prevMonday.getDate() + lastDayOffset);
      const targetPrevDateStr = `${targetPrevDate.getFullYear()}-${(targetPrevDate.getMonth() + 1).toString().padStart(2, '0')}-${targetPrevDate.getDate().toString().padStart(2, '0')}`;
      setSelectedDateStr(targetPrevDateStr);
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
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        goToNextDay();
      } else {
        goToPrevDay();
      }
    }
  };

  // Quick Jump Handlers (matching the mobile screenshot pills: Dzisiaj, Jutro, Cały tydzień, Przyszły tydzień)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;

  const isTodaySelected = selectedDateStr === todayStr;
  const isTomorrowSelected = selectedDateStr === tomorrowStr;

  const handleQuickToday = () => {
    const tMonday = new Date(today);
    const day = tMonday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    tMonday.setDate(tMonday.getDate() + diff);
    tMonday.setHours(0, 0, 0, 0);

    setSelectedDateStr(todayStr);
    if (tMonday.getTime() !== baseMonday.getTime()) {
      if (onNavigateToMonday) onNavigateToMonday(tMonday);
      else if (onToday) onToday();
    }
  };

  const handleQuickTomorrow = () => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    const tmMonday = new Date(tm);
    const day = tmMonday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    tmMonday.setDate(tmMonday.getDate() + diff);
    tmMonday.setHours(0, 0, 0, 0);

    setSelectedDateStr(tomorrowStr);
    if (tmMonday.getTime() !== baseMonday.getTime()) {
      if (onNavigateToMonday) onNavigateToMonday(tmMonday);
      else if (onNextWeek) onNextWeek();
    }
  };

  const handleQuickWholeWeek = () => {
    if (onSwitchViewMode) {
      onSwitchViewMode('week');
    }
  };

  const handleQuickNextWeek = () => {
    const nextM = new Date(baseMonday);
    nextM.setDate(baseMonday.getDate() + 7);
    const curIdx = currentWeekDays.findIndex((d) => d.dateStr === selectedDateStr);
    const offset = curIdx >= 0 ? curIdx : 0;
    const nextDate = new Date(nextM);
    nextDate.setDate(nextM.getDate() + offset);
    const nextDateStr = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}-${nextDate.getDate().toString().padStart(2, '0')}`;

    setSelectedDateStr(nextDateStr);
    if (onNavigateToMonday) onNavigateToMonday(nextM);
    else if (onNextWeek) onNextWeek();
  };

  // Week range label: e.g. "Tydzień 12.10.2026 – 18.10.2026"
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

  // Timeline hours array: [7, 8, ..., 21]
  const timelineHours = useMemo(() => {
    const arr = [];
    for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
      arr.push(h);
    }
    return arr;
  }, []);

  // Live time indicator positioning
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isViewingToday = activeDay?.isToday;
  const showLiveTimeLine = isViewingToday && nowMin >= TIMELINE_START_HOUR * 60 && nowMin <= TIMELINE_END_HOUR * 60;
  const liveTimeTop = ((nowMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT;

  return (
    <div className="space-y-3 sm:space-y-4">


      {/* 2. Week Info Header & View Toggle (Timeline Grid vs List) */}
      <div className="flex items-center justify-between px-1 text-xs sm:text-sm">
        <div className="flex items-center space-x-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#fa243c]" />
          <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-xs sm:text-sm">
            Tydzień {weekRangeStr}
          </span>
          {isNavigatingWeek && (
            <span className="text-[10px] text-[#fa243c] animate-pulse font-normal">• Ładowanie...</span>
          )}
        </div>

        {/* Quick week navigation arrows */}
        <div className="flex items-center space-x-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] p-0.5">
          <button
            onClick={onPrevWeek}
            disabled={isNavigatingWeek}
            className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
            title="Poprzedni tydzień"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNextWeek}
            disabled={isNavigatingWeek}
            className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] active:scale-90 transition-all disabled:opacity-40"
            title="Następny tydzień"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Day Tabs Bar with Magnetic Week Scroll Ribbon */}
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
              className={`grid ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'
                } gap-1.5 sm:gap-2 w-full select-none`}
            >
              {week.days.map((day) => {
                const isSelected = selectedDateStr === day.dateStr;
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      handleDaySelect(day);
                    }}
                    className={`flex flex-col items-center justify-between h-[66px] sm:h-[72px] w-full p-1.5 sm:p-2 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer relative ${isSelected
                      ? 'bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-md shadow-[#fa243c]/25 font-semibold scale-[1.02]'
                      : 'apple-card text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                      }`}
                  >
                    <div className="flex items-center space-x-1 text-[11px] sm:text-xs">
                      <span>{day.short}</span>
                      {day.isToday && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#fa243c] animate-pulse'
                            }`}
                        />
                      )}
                    </div>
                    <span className="text-base sm:text-lg font-bold leading-none">{day.dayNum}</span>
                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium truncate max-w-full text-center leading-none ${isSelected
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

                    {/* Active Tab indicator underline (matching the tab bar UX) */}
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

      {/* 4. Active Day Content Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="apple-card rounded-3xl p-3 sm:p-5 min-h-[460px] sm:min-h-[520px] relative transition-all duration-300 overflow-hidden"
      >
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
              {activitiesToDisplay.length === 0
                ? 'Dzień wolny od zajęć dydaktycznych'
                : `${activitiesToDisplay.length} ${activitiesToDisplay.length === 1 ? 'zajęcia' : 'zajęć'
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

        {/* Content Rendering: Smooth Animated Day Container */}
        <div key={`day-content-${selectedDateStr}`} className="anim-timeline-enter">
          {isNavigatingWeek ? (
            <div className="py-24 text-center flex flex-col items-center justify-center space-y-3 min-h-[340px]">
              <div className="w-8 h-8 rounded-full border-2 border-[#fa243c] border-t-transparent animate-spin" />
              <p className="text-xs text-[#86868b] font-medium">Pobieranie planu zajęć z USOS PRZ...</p>
            </div>
          ) : activitiesToDisplay.length === 0 ? (
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
            /* ========================================================
               HOURLY TIMELINE GRID ("Oś czasu")
               ======================================================== */
            <div
              ref={timelineScrollRef}
              className="mt-3 overflow-y-auto max-h-[580px] sm:max-h-[640px] pr-1 scrollbar-thin select-none"
            >
              <div className="relative flex" style={{ height: TOTAL_TIMELINE_HEIGHT }}>
                {/* Left Column: Hours Axis (07:00, 08:00, ... 21:00) */}
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
                      {/* Hour divider line */}
                      <div
                        className="absolute left-0 right-0 border-t border-black/[0.06] dark:border-white/[0.08]"
                        style={{ top: idx * HOUR_HEIGHT }}
                      />
                      {/* Half-hour dashed divider line */}
                      {idx < timelineHours.length - 1 && (
                        <div
                          className="absolute left-0 right-0 border-t border-dashed border-black/[0.03] dark:border-white/[0.04]"
                          style={{ top: idx * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                        />
                      )}
                    </React.Fragment>
                  ))}

                  {/* Visual Breaks / Windows ("Okienka") in gaps between classes */}
                  {dayBreaks.map((breakInfo, bIdx) => {
                    const bStartMin =
                      breakInfo.startTime.getHours() * 60 + breakInfo.startTime.getMinutes();
                    const bEndMin =
                      breakInfo.endTime.getHours() * 60 + breakInfo.endTime.getMinutes();
                    const bTop =
                      ((bStartMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT;
                    const bHeight =
                      ((bEndMin - bStartMin) / 60) * HOUR_HEIGHT;

                    if (breakInfo.durationMinutes < 15 || bHeight < 24) return null;

                    const duration = formatBreakDuration(breakInfo.durationMinutes);
                    const isCurrentBreak =
                      activeDay?.isToday &&
                      now.getTime() >= breakInfo.startTime.getTime() &&
                      now.getTime() < breakInfo.endTime.getTime();

                    return (
                      <div
                        key={`break-${breakInfo.toActId}`}
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
                  })}

                  {/* Proportional Class Activity Blocks */}
                  {timelineItems.map((item, itemIdx) => {
                    const act = item.activity;
                    const startStr = formatTime(item.start);
                    const endStr = formatTime(item.end);

                    const diffMin = Math.round(
                      (item.end.getTime() - item.start.getTime()) / (1000 * 60)
                    );
                    const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}m` : ''
                      }`.trim();

                    const name =
                      typeof act.name === 'string'
                        ? act.name
                        : act.name?.pl || 'Zajęcia';
                    const classtype =
                      typeof act.classtype_name === 'string'
                        ? act.classtype_name
                        : act.classtype_name?.pl || act.category || '';
                    const room = act.room_number || '';
                    const building =
                      typeof act.building_name === 'string'
                        ? act.building_name
                        : act.building_name?.pl || '';
                    const lecturers = act.lecturer_names?.join(', ') || '';

                    const isPast = item.end.getTime() < now.getTime();
                    const isCurrent =
                      now.getTime() >= item.start.getTime() &&
                      now.getTime() <= item.end.getTime();
                    const baseColor = act.color || '#fa243c';

                    const colWidthPercent = 100 / item.totalCols;
                    const leftPercent = item.colIndex * colWidthPercent;

                    return (
                      <div
                        key={act.id}
                        onClick={() => onSelectActivity(act)}
                        className={`absolute rounded-2xl p-2 sm:p-2.5 transition-all duration-200 cursor-pointer overflow-hidden border shadow-xs hover:shadow-md active:scale-[0.99] group anim-item-card ${isCurrent
                          ? 'bg-[#fa243c]/[0.1] dark:bg-[#fa243c]/[0.18] border-[#fa243c]/50 ring-2 ring-[#fa243c]/25'
                          : isPast
                            ? 'opacity-65 hover:opacity-100 bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08]'
                            : 'apple-glass border-black/[0.08] dark:border-white/[0.12] hover:border-[#fa243c]/40'
                          }`}
                        style={{
                          top: item.topPx + 2,
                          height: Math.max(44, item.heightPx - 4),
                          left: `calc(${leftPercent}% + 2px)`,
                          width: `calc(${colWidthPercent}% - 4px)`,
                          borderLeftWidth: '4px',
                          borderLeftColor: baseColor,
                          animationDelay: `${Math.min(itemIdx * 40, 200)}ms`,
                        }}
                      >
                        {/* Top Row: Time, Classtype Badge, Status */}
                        <div className="flex items-center justify-between gap-1 text-[11px] leading-tight">
                          <div className="flex items-center space-x-1.5 font-semibold">
                            <span
                              className={
                                isCurrent
                                  ? 'text-[#fa243c] font-bold'
                                  : isPast
                                    ? 'text-[#86868b]'
                                    : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                              }
                            >
                              {startStr} – {endStr}
                            </span>
                            <span className="text-[10px] text-[#86868b] font-normal hidden xs:inline">
                              ({durationStr})
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-2xs">
                                TRWA
                              </span>
                            )}
                            {isPast && (
                              <span className="text-[9px] text-[#86868b] px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08]">
                                ✓
                              </span>
                            )}
                            <span
                              className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase truncate max-w-[65px]"
                              style={{
                                backgroundColor: isPast
                                  ? 'rgba(134,134,139,0.1)'
                                  : `${baseColor}18`,
                                color: isPast ? '#86868b' : baseColor,
                              }}
                            >
                              {classtype}
                            </span>
                          </div>
                        </div>

                        {/* Subject Title */}
                        <h4
                          className={`font-semibold text-xs sm:text-sm mt-1 transition-colors leading-snug line-clamp-2 ${isCurrent
                            ? 'text-[#1d1d1f] dark:text-[#f5f5f7] font-bold'
                            : isPast
                              ? 'text-[#86868b]'
                              : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#fa243c]'
                            }`}
                        >
                          {name}
                        </h4>

                        {/* Location & Lecturer Info */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#86868b]">
                          {(building || room) && (
                            <span className="flex items-center space-x-1 font-medium">
                              <MapPin className="w-3 h-3 text-[#86868b] shrink-0" />
                              <span className="truncate">
                                {[room, building].filter(Boolean).join(' • ')}
                              </span>
                            </span>
                          )}

                          {lecturers && item.heightPx >= 75 && (
                            <span className="flex items-center space-x-1 truncate max-w-full">
                              <User className="w-3 h-3 text-[#86868b] shrink-0" />
                              <span className="truncate">{lecturers}</span>
                            </span>
                          )}

                          {act.group_number && (
                            <span className="font-mono text-[10px] text-[#86868b]">
                              gr. {act.group_number}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Red Live Current Time Indicator Line (if viewing today) */}
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
          )}
        </div>
      </div>
    </div>
  );
};
