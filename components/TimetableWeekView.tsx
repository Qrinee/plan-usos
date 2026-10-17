'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';

interface TimetableWeekViewProps {
  activities: USOSActivity[];
  baseMonday: Date;
  showWeekend: boolean;
  onSelectActivity: (act: USOSActivity) => void;
}

const HOUR_HEIGHT = 68;

export const TimetableWeekView: React.FC<TimetableWeekViewProps> = ({
  activities,
  baseMonday,
  showWeekend,
  onSelectActivity,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeScrollDayIdx, setActiveScrollDayIdx] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const days = useMemo(() => {
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

  const currentTimeInfo = useMemo(() => {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const top = ((currentHour - startHour) + currentMin / 60) * HOUR_HEIGHT;
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

  return (
    <div className="w-full apple-card rounded-3xl overflow-hidden flex flex-col shadow-xs">
      <div className="sm:hidden flex items-center space-x-1.5 p-2 px-3 border-b border-black/[0.04] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] overflow-x-auto scrollbar-none touch-momentum">
        <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mr-1 shrink-0">
          Dzień:
        </span>
        {days.map((day, idx) => {
          const isToday = day.isToday;
          const isSelected = activeScrollDayIdx === idx;
          const count = activitiesByDay[day.dateStr]?.length || 0;

          return (
            <button
              key={day.offset}
              type="button"
              onClick={() => scrollToDay(idx)}
              className={`px-3 py-1.5 min-h-[32px] rounded-full text-xs font-medium shrink-0 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-xs font-semibold scale-[1.02]'
                  : isToday
                  ? 'bg-[#fa243c]/15 text-[#fa243c] font-semibold ring-1 ring-[#fa243c]/30'
                  : 'bg-white/70 dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.04] dark:border-white/[0.08]'
              }`}
            >
              <span>{day.short}</span>
              <span className="opacity-80 text-[11px] font-mono">{day.dayNum}</span>
              {count > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#fa243c]'}`} />
              )}
            </button>
          );
        })}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-x-auto touch-momentum relative scrollbar-none"
      >
        <div style={{ minWidth: `calc(48px + ${days.length} * 165px)` }} className="w-full">
          <div 
            className="grid border-b border-black/[0.04] dark:border-white/[0.06] apple-glass select-none sticky top-0 z-30"
            style={{
              gridTemplateColumns: `48px repeat(${days.length}, minmax(165px, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-40 p-2 text-center border-r border-black/[0.06] dark:border-white/[0.08] text-[10px] sm:text-[11px] font-semibold text-[#86868b] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.4)] flex items-center justify-center">
              Godz.
            </div>

            {days.map((day, idx) => (
              <div
                key={day.offset}
                onClick={() => scrollToDay(idx)}
                className={`py-2 sm:py-3 px-2 text-center border-r last:border-r-0 border-black/[0.04] dark:border-white/[0.06] transition-colors cursor-pointer select-none ${
                  day.isToday ? 'bg-[#fa243c]/[0.04] dark:bg-[#fa243c]/[0.08]' : ''
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
                  <span className={`text-[11px] font-medium ${day.isToday ? 'text-[#fa243c] font-semibold' : 'text-[#86868b]'}`}>
                    {day.short}
                  </span>
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                      day.isToday
                        ? 'bg-[#fa243c] text-white shadow-xs shadow-[#fa243c]/30'
                        : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                    }`}
                  >
                    {day.dayNum}
                  </span>
                </div>

                {day.isToday && (
                  <div className="mt-0.5 sm:mt-1 flex items-center justify-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fa243c] animate-ping shrink-0" />
                    <span className="text-[10px] font-mono font-medium text-[#fa243c]">
                      {currentTimeInfo.timeString}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className="grid relative"
            style={{
              gridTemplateColumns: `48px repeat(${days.length}, minmax(165px, 1fr))`,
              height: `${hours.length * HOUR_HEIGHT}px`,
            }}
          >
            <div className="sticky left-0 z-20 border-r border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md select-none shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.4)]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative border-b border-black/[0.03] dark:border-white/[0.04] text-[10px] sm:text-[11px] text-[#86868b] font-medium text-center font-mono"
                  style={{ height: `${HOUR_HEIGHT}px` }}
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

            {days.map((day) => {
              const dayActs = activitiesByDay[day.dateStr] || [];

              return (
                <div
                  key={day.offset}
                  className={`relative border-r last:border-r-0 border-black/[0.04] dark:border-white/[0.06] transition-colors ${
                    day.isToday ? 'bg-[#fa243c]/[0.02] dark:bg-[#fa243c]/[0.04]' : ''
                  }`}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-black/[0.03] dark:border-white/[0.04] pointer-events-none"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {!day.isToday && hasTodayInWeek && currentTimeInfo.inGrid && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none border-b border-dashed border-[#fa243c]/20"
                      style={{ top: `${currentTimeInfo.top}px` }}
                    />
                  )}

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

                  {dayActs.map((act) => {
                    const start = parseDate(act.start_time);
                    const end = parseDate(act.end_time);

                    const startDec = start.getHours() + start.getMinutes() / 60;
                    const endDec = end.getHours() + end.getMinutes() / 60;

                    const top = Math.max(0, (startDec - startHour) * HOUR_HEIGHT);
                    const height = Math.max(48, (endDec - startDec) * HOUR_HEIGHT);

                    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
                    const classtype = typeof act.classtype_name === 'string' ? act.classtype_name : act.classtype_name?.pl || act.category || '';
                    const room = act.room_number || '';

                    const isPast = end.getTime() < now.getTime();
                    const isCurrent = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
                    const baseColor = act.color || '#0071e3';

                    return (
                      <div
                        key={act.id}
                        onClick={() => onSelectActivity(act)}
                        className={`absolute left-1 right-1 rounded-2xl p-2 sm:p-2.5 cursor-pointer backdrop-blur-md overflow-hidden flex flex-col justify-between border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isCurrent
                            ? 'border-[#fa243c] ring-2 ring-[#fa243c]/30 shadow-lg shadow-[#fa243c]/15 scale-[1.01] z-20'
                            : isPast
                            ? 'opacity-40 hover:opacity-100 grayscale-[40%] hover:grayscale-0 shadow-none border-dashed border-black/10 dark:border-white/10'
                            : 'shadow-xs hover:shadow-md hover:scale-[1.01] hover:z-20'
                        }`}
                        style={{
                          top: `${top + 2}px`,
                          height: `${height - 4}px`,
                          backgroundColor: isCurrent
                            ? 'rgba(250, 36, 60, 0.12)'
                            : isPast
                            ? 'rgba(0, 0, 0, 0.02)'
                            : `${baseColor}14`,
                          borderColor: isCurrent
                            ? '#fa243c'
                            : isPast
                            ? undefined
                            : `${baseColor}30`,
                          borderLeftWidth: '3.5px',
                          borderLeftColor: isCurrent
                            ? '#fa243c'
                            : isPast
                            ? '#86868b'
                            : baseColor,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-medium mb-1">
                            <span className={`flex items-center text-[10px] truncate ${isPast ? 'text-[#86868b] line-through' : isCurrent ? 'text-[#fa243c] font-semibold' : 'text-[#86868b]'}`}>
                              <Clock className="w-2.5 h-2.5 mr-1 shrink-0 opacity-70" />
                              <span className="truncate">{startTimeStr} – {endTimeStr}</span>
                            </span>

                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider text-[8px] bg-[#fa243c] text-white shrink-0 shadow-2xs">
                                TERAZ
                              </span>
                            )}

                            {!isCurrent && classtype && (
                              <span
                                className="px-1.5 py-0.2 rounded-full font-medium text-[9px] truncate max-w-[70px] shrink-0"
                                style={{
                                  backgroundColor: isPast ? 'rgba(134, 134, 139, 0.1)' : `${baseColor}20`,
                                  color: isPast ? '#86868b' : baseColor,
                                }}
                              >
                                {classtype}
                              </span>
                            )}
                          </div>

                          <h4 className={`font-semibold text-xs leading-tight line-clamp-2 transition-colors ${
                            isCurrent
                              ? 'text-[#fa243c] dark:text-[#fb5c74] font-bold'
                              : isPast
                              ? 'text-[#86868b]'
                              : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                          }`}>
                            {name}
                          </h4>
                        </div>

                        {height >= 65 && (
                          <div className="mt-1 flex items-center justify-between text-[10px] text-[#86868b] pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                            {room ? (
                              <span className="flex items-center font-medium truncate max-w-[80%] text-[10px]">
                                <MapPin className="w-2.5 h-2.5 mr-0.5 text-[#86868b] shrink-0" />
                                <span className="truncate">{room}</span>
                              </span>
                            ) : (
                              <span />
                            )}

                            {act.group_number && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] shrink-0">
                                Gr.{act.group_number}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
