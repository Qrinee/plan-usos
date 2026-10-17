'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, User, FileText, CheckCircle } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';

interface TimetableDayViewProps {
  activities: USOSActivity[];
  baseMonday: Date;
  showWeekend: boolean;
  onSelectActivity: (act: USOSActivity) => void;
}

export const TimetableDayView: React.FC<TimetableDayViewProps> = ({
  activities,
  baseMonday,
  showWeekend,
  onSelectActivity,
}) => {
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

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    return list.map((item) => {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + item.offset);
      const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const isToday = dateStr === todayStr;

      const count = activities.filter((act) => act.start_time.startsWith(dateStr)).length;

      return {
        ...item,
        date: d,
        dateStr,
        dayNum: d.getDate(),
        isToday,
        count,
      };
    });
  }, [baseMonday, showWeekend, activities]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const todayDay = days.find((d) => d.isToday);
    return todayDay ? todayDay.dateStr : days[0]?.dateStr || '';
  });

  useEffect(() => {
    const todayDay = days.find((d) => d.isToday);
    setSelectedDateStr(todayDay ? todayDay.dateStr : days[0]?.dateStr || '');
  }, [baseMonday, days]);

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const activeDayActivities = useMemo(() => {
    return activities
      .filter((act) => act.start_time.substring(0, 10) === selectedDateStr)
      .sort((a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime());
  }, [activities, selectedDateStr]);

  const activeDay = days.find((d) => d.dateStr === selectedDateStr);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none touch-momentum pb-1 -mx-1 px-1">
        {days.map((day) => {
          const isSelected = selectedDateStr === day.dateStr;
          return (
            <button
              key={day.offset}
              onClick={() => setSelectedDateStr(day.dateStr)}
              className={`flex flex-col items-center min-w-[68px] sm:min-w-[90px] p-2 sm:p-2.5 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-md shadow-[#fa243c]/20 font-semibold scale-[1.02]'
                  : 'apple-card text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center space-x-1 text-xs">
                <span>{day.short}</span>
                {day.isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#fa243c] animate-pulse'}`} />
                )}
              </div>
              <span className="text-base font-semibold mt-0.5">{day.dayNum}</span>
              <span className={`text-[10px] mt-1 px-2 py-0.2 rounded-full font-medium ${
                isSelected ? 'bg-white/20 text-white' : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b]'
              }`}>
                {day.count} {day.count === 1 ? 'zajęcia' : 'zajęć'}
              </span>
            </button>
          );
        })}
      </div>

      <div key={selectedDateStr} className="apple-card rounded-3xl p-3.5 sm:p-6 anim-filter-fade">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {activeDay?.name},{' '}
              {activeDay?.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              {activeDayActivities.length === 0
                ? 'Brak zaplanowanych zajęć'
                : `Łącznie ${activeDayActivities.length} ${
                    activeDayActivities.length === 1 ? 'blok zajęciowy' : 'bloki zajęciowe'
                  }`}
            </p>
          </div>
          {activeDay?.isToday && (
            <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#fa243c]/10 text-[#fa243c] text-[11px] sm:text-xs font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fa243c] animate-ping shrink-0" />
              <span>Dziś • {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {activeDayActivities.length === 0 ? (
          <div className="py-16 text-center text-[#86868b]">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-[#86868b]/40" />
            <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Wolne od zajęć</p>
            <p className="text-xs mt-1 text-[#86868b]">Brak zaplanowanych ćwiczeń, laboratoriów ani wykładów.</p>
          </div>
        ) : (
          <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-3.5 relative before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-[1.5px] before:bg-black/[0.05] dark:before:bg-white/[0.08]">
            {(() => {
              const nowMs = now.getTime();
              const nextActIdx = activeDayActivities.findIndex(
                (act) => parseDate(act.start_time).getTime() > nowMs
              );
              const hasOngoing = activeDayActivities.some(
                (act) => parseDate(act.start_time).getTime() <= nowMs && parseDate(act.end_time).getTime() >= nowMs
              );

              const renderTimeMarker = (isDone?: boolean) => (
                <div key="live-time-marker" className="relative pl-7 sm:pl-10 my-2.5 sm:my-3 py-1">
                  <div className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#fa243c] ring-3 ring-[#fa243c]/30 flex items-center justify-center z-10 shadow-xs">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-[1.5px] w-4 sm:w-6 bg-[#fa243c]" />
                    <span className="text-[11px] font-mono font-medium text-[#fa243c] bg-[#fa243c]/10 px-2 sm:px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Teraz: <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                      {isDone && (
                        <span className="text-[10px] text-[#86868b] font-sans ml-1 hidden xs:inline">
                          • Wszystkie zajęcia zakończone
                        </span>
                      )}
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#fa243c]/40 to-transparent" />
                  </div>
                </div>
              );

              return (
                <>
                  {activeDay?.isToday && !hasOngoing && nextActIdx === 0 && renderTimeMarker(false)}
                  {activeDayActivities.map((act, idx) => {
                    const start = parseDate(act.start_time);
                    const end = parseDate(act.end_time);
                    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    const diffMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                    const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}min` : ''}`.trim();

                    const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
                    const classtype = typeof act.classtype_name === 'string' ? act.classtype_name : act.classtype_name?.pl || act.category || '';
                    const room = act.room_number || '';
                    const building = typeof act.building_name === 'string' ? act.building_name : act.building_name?.pl || '';
                    const lecturers = act.lecturer_names?.join(', ') || '';

                    const isPast = end.getTime() < now.getTime();
                    const isCurrent = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
                    const baseColor = act.color || '#fa243c';

                    const showMarkerBeforeThis = activeDay?.isToday && !hasOngoing && nextActIdx === idx && idx > 0;
                    const showMarkerAfterThis = activeDay?.isToday && !hasOngoing && nextActIdx === -1 && idx === activeDayActivities.length - 1;

                    return (
                      <React.Fragment key={act.id}>
                        {showMarkerBeforeThis && renderTimeMarker(false)}
                        <div
                          onClick={() => onSelectActivity(act)}
                          className="relative pl-7 sm:pl-10 cursor-pointer group active:scale-[0.99] transition-transform"
                        >
                          <div
                            className={`absolute left-1.5 sm:left-2.5 top-4 sm:top-5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1c1c1e] shadow-xs transition-transform duration-300 group-hover:scale-125 z-10 ${
                              isCurrent
                                ? 'bg-[#fa243c] ring-4 ring-[#fa243c]/30 shadow-md shadow-[#fa243c]/30'
                                : isPast
                                ? 'bg-[#86868b]/40'
                                : ''
                            }`}
                            style={!isCurrent && !isPast ? { backgroundColor: baseColor } : undefined}
                          />

                          <div className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            isCurrent
                              ? 'bg-[#fa243c]/[0.08] dark:bg-[#fa243c]/[0.15] border border-[#fa243c]/40 ring-2 ring-[#fa243c]/20 shadow-md shadow-[#fa243c]/10'
                              : isPast
                              ? 'opacity-40 hover:opacity-100 grayscale-[35%] hover:grayscale-0 bg-black/[0.015] dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10'
                              : 'apple-card hover:scale-[1.008]'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-semibold flex items-center ${isPast ? 'text-[#86868b] line-through' : isCurrent ? 'text-[#fa243c]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'}`}>
                                  <Clock className="w-3.5 h-3.5 mr-1 text-[#86868b]" />
                                  {startTimeStr} – {endTimeStr}
                                </span>
                                <span className="text-[11px] text-[#86868b]">({durationStr})</span>

                                {isCurrent && (
                                  <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    <span>Teraz</span>
                                  </span>
                                )}

                                {isPast && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium text-[#86868b] bg-black/[0.04] dark:bg-white/[0.08]">
                                    ✓ Zakończone
                                  </span>
                                )}

                                <span
                                  className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                                  style={{
                                    backgroundColor: isPast ? 'rgba(134, 134, 139, 0.1)' : `${baseColor}15`,
                                    color: isPast ? '#86868b' : baseColor,
                                  }}
                                >
                                  {classtype}
                                </span>
                              </div>

                              {act.group_number && (
                                <span className="text-xs font-mono font-medium text-[#86868b] bg-black/[0.03] dark:bg-white/[0.08] px-2 py-0.5 rounded-full self-start sm:self-auto">
                                  Gr. {act.group_number}
                                </span>
                              )}
                            </div>

                            <h4 className={`text-sm font-semibold transition-colors mt-1.5 ${
                              isCurrent
                                ? 'text-[#1d1d1f] dark:text-[#f5f5f7] font-bold text-base'
                                : isPast
                                ? 'text-[#86868b]'
                                : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#fa243c]'
                            }`}>
                              {name}
                            </h4>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#86868b]">
                              {(building || room) && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                                  <span>{[room, building].filter(Boolean).join(' • ')}</span>
                                </span>
                              )}
                              {lecturers && (
                                <span className="flex items-center space-x-1">
                                  <User className="w-3.5 h-3.5 text-[#86868b]" />
                                  <span>{lecturers}</span>
                                </span>
                              )}
                              {act.note && (
                                <span className="flex items-center space-x-1 text-[#ff9500]">
                                  <FileText className="w-3.5 h-3.5" />
                                  <span className="truncate max-w-xs">{act.note}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {showMarkerAfterThis && renderTimeMarker(true)}
                      </React.Fragment>
                    );
                  })}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
