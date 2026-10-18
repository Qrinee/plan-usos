'use client';

import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { DayItem, WeekDaysGroup } from './types';

interface UseDayViewNavigationProps {
  activities: USOSActivity[];
  baseMonday: Date;
  showWeekend: boolean;
  onNavigateToMonday?: (monday: Date) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export function useDayViewNavigation({
  activities,
  baseMonday,
  showWeekend,
  onNavigateToMonday,
  onPrevWeek,
  onNextWeek,
}: UseDayViewNavigationProps) {
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

      const animClass = isMovingForward ? 'anim-week-slide-right' : 'anim-week-slide-left';
      setWeekSlideAnim(animClass);
      setWeekAnimKey((k) => k + 1);
    }
  }, [baseMonday, currentWeekDays, selectedDateStr]);

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

  return {
    weeksList,
    currentWeekDays,
    allDays,
    selectedDateStr,
    setSelectedDateStr,
    activeDay,
    handleDaySelect,
    weekRangeStr,
    weekSlideAnim,
    setWeekSlideAnim,
    weekAnimKey,
    setWeekAnimKey,
  };
}
