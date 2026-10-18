'use client';

import { useState, useEffect, useMemo } from 'react';
import { WEEK_HOUR_HEIGHT, WeekDayItem, CurrentTimeInfo } from './types';

interface UseWeekGridProps {
  baseMonday: Date;
  showWeekend: boolean;
}

export function useWeekGrid({ baseMonday, showWeekend }: UseWeekGridProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

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
    now,
    days,
    hasTodayInWeek,
    startHour,
    endHour,
    hours,
    currentTimeInfo,
    weekRangeStr,
  };
}
