'use client';

import React, { useMemo } from 'react';
import {
  Clock,
  MapPin,
  User,
  Footprints,
  Coffee,
  CheckCircle2,
  CalendarCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { formatTime, parseDate } from '@/lib/utils/date';
import { analyzeCampusTransit } from '@/lib/utils/transit';

interface DayAgendaListProps {
  activities: USOSActivity[];
  now: Date;
  isToday: boolean;
  onSelectActivity: (act: USOSActivity) => void;
}

export const DayAgendaList: React.FC<DayAgendaListProps> = ({
  activities,
  now,
  isToday,
  onSelectActivity,
}) => {
  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime()
    );
  }, [activities]);

  const nowMs = now.getTime();

  // Find index of first future/current activity
  const nextActIndex = useMemo(() => {
    if (!isToday) return -1;
    return sortedActivities.findIndex(
      (act) => parseDate(act.end_time).getTime() > nowMs
    );
  }, [sortedActivities, isToday, nowMs]);

  const totalDurationMinutes = useMemo(() => {
    return sortedActivities.reduce((acc, act) => {
      const s = parseDate(act.start_time).getTime();
      const e = parseDate(act.end_time).getTime();
      return acc + Math.max(0, Math.round((e - s) / (1000 * 60)));
    }, 0);
  }, [sortedActivities]);

  const totalDurationStr = useMemo(() => {
    const h = Math.floor(totalDurationMinutes / 60);
    const m = totalDurationMinutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} godz.`;
    return `${h}h ${m}m`;
  }, [totalDurationMinutes]);

  return (
    <div className="pt-2 pb-36 sm:pb-20 space-y-3.5 select-none anim-filter-fade">
      {/* Day Overview Summary Pill */}
      <div className="flex items-center justify-between px-1 text-xs text-[#86868b]">
        <div className="flex items-center space-x-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#fa243c]" />
          <span>
            {sortedActivities.length}{' '}
            {sortedActivities.length === 1 ? 'blok zajęć' : 'bloków zajęć'} • {totalDurationStr}
          </span>
        </div>

        {isToday && nextActIndex >= 0 && (
          <div className="text-[11px] font-semibold text-[#fa243c] flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 fill-[#fa243c] animate-pulse" />
            <span>
              {parseDate(sortedActivities[nextActIndex].start_time).getTime() <= nowMs
                ? 'Zajęcia w toku'
                : `Kolejne o ${formatTime(parseDate(sortedActivities[nextActIndex].start_time))}`}
            </span>
          </div>
        )}
      </div>

      {sortedActivities.map((act, index) => {
        const start = parseDate(act.start_time);
        const end = parseDate(act.end_time);
        const startStr = formatTime(start);
        const endStr = formatTime(end);

        const diffMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}m` : ''}`.trim();

        const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
        const classtype =
          typeof act.classtype_name === 'string'
            ? act.classtype_name
            : act.classtype_name?.pl || act.category || 'Zajęcia';
        const room = (act.room_number || '').trim();
        const building =
          typeof act.building_name === 'string'
            ? act.building_name
            : act.building_name?.pl || '';
        const lecturers = act.lecturer_names?.join(', ') || '';
        const baseColor = act.color || '#fa243c';

        const isCurrent = isToday && nowMs >= start.getTime() && nowMs <= end.getTime();
        const isPast = isToday && end.getTime() < nowMs;
        const isNext = isToday && index === nextActIndex && !isCurrent;

        // Calculate break from previous class
        let breakInfo: {
          minutes: number;
          isWindow: boolean;
          transitNote?: string;
          urgency?: 'critical' | 'tight' | 'comfortable';
        } | null = null;

        if (index > 0) {
          const prev = sortedActivities[index - 1];
          const prevEnd = parseDate(prev.end_time);
          const gapMin = Math.round((start.getTime() - prevEnd.getTime()) / (1000 * 60));

          if (gapMin > 0) {
            const transit = analyzeCampusTransit(prev, act);
            let transitNote = '';
            if (transit) {
              if (transit.isSameRoom) {
                transitNote = 'W tej samej sali';
              } else if (transit.isSameBuilding) {
                transitNote = `W tym samym budynku (${transit.fromBuildingCode})`;
              } else {
                transitNote = `Przejście: ${transit.fromBuildingCode} → ${transit.toBuildingCode} (~${transit.walkingMinutes} min pieszo)`;
              }
            }

            breakInfo = {
              minutes: gapMin,
              isWindow: gapMin >= 45,
              transitNote,
              urgency: transit?.urgency,
            };
          }
        }

        const remainingCurrentMin = isCurrent
          ? Math.max(1, Math.round((end.getTime() - nowMs) / (1000 * 60)))
          : null;

        const minutesUntilStart = isNext
          ? Math.max(1, Math.round((start.getTime() - nowMs) / (1000 * 60)))
          : null;

        return (
          <React.Fragment key={act.id}>
            {/* Visual Break / Transit Connector */}
            {breakInfo && (
              <div className="py-1 px-2 flex items-center justify-between text-xs transition-all">
                <div className="flex items-center space-x-2 text-[#86868b]">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 ml-2" />
                  <div
                    className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-medium ${
                      breakInfo.isWindow
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868b]'
                    }`}
                  >
                    <Coffee className="w-3 h-3 shrink-0" />
                    <span>
                      {breakInfo.isWindow
                        ? `Okienko ${Math.floor(breakInfo.minutes / 60)}h ${
                            breakInfo.minutes % 60 ? `${breakInfo.minutes % 60}m` : ''
                          }`
                        : `${breakInfo.minutes} min przerwy`}
                    </span>
                  </div>
                </div>

                {breakInfo.transitNote && (
                  <div
                    className={`flex items-center space-x-1 text-[11px] truncate max-w-[55%] ${
                      breakInfo.urgency === 'tight' || breakInfo.urgency === 'critical'
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-[#86868b]'
                    }`}
                  >
                    <Footprints className="w-3 h-3 shrink-0" />
                    <span className="truncate">{breakInfo.transitNote}</span>
                  </div>
                )}
              </div>
            )}

            {/* Main Activity Agenda Card */}
            <div
              onClick={() => onSelectActivity(act)}
              className={`w-full rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer border shadow-xs hover:shadow-md active:scale-[0.99] relative overflow-hidden group ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#fa243c]/[0.08] via-transparent to-transparent dark:from-[#fa243c]/[0.18] border-[#fa243c]/40 ring-2 ring-[#fa243c]/25 shadow-md shadow-[#fa243c]/10'
                  : isPast
                  ? 'opacity-65 hover:opacity-100 bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.05] dark:border-white/[0.07]'
                  : isNext
                  ? 'bg-white/90 dark:bg-[#1c1c1e]/90 border-[#fa243c]/25 shadow-xs ring-1 ring-[#fa243c]/15'
                  : 'apple-glass border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.15]'
              }`}
              style={{
                borderLeftWidth: '5px',
                borderLeftColor: baseColor,
              }}
            >
              {/* Header row: Time, Duration & Status Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                      isCurrent
                        ? 'text-[#fa243c]'
                        : isPast
                        ? 'text-[#86868b]'
                        : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                    }`}
                  >
                    {startStr} – {endStr}
                  </span>
                  <span className="text-xs text-[#86868b] font-normal">
                    ({durationStr})
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-xs flex items-center space-x-1 animate-pulse">
                      <span>TRWA TERAZ</span>
                      {remainingCurrentMin && <span>({remainingCurrentMin}m)</span>}
                    </span>
                  )}

                  {isNext && minutesUntilStart && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      Za {minutesUntilStart} min
                    </span>
                  )}

                  {isPast && (
                    <span className="text-[10px] text-[#86868b] font-medium px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                      Zakończone
                    </span>
                  )}

                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                    style={{
                      backgroundColor: isPast ? 'rgba(134,134,139,0.1)' : `${baseColor}18`,
                      color: isPast ? '#86868b' : baseColor,
                    }}
                  >
                    {classtype}
                  </span>
                </div>
              </div>

              {/* Subject Title */}
              <div className="mt-2 flex items-start justify-between gap-2">
                <h4
                  className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
                    isCurrent
                      ? 'text-[#1d1d1f] dark:text-[#f5f5f7] font-bold'
                      : isPast
                      ? 'text-[#86868b]'
                      : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#fa243c]'
                  }`}
                >
                  {name}
                </h4>
                <ChevronRight className="w-4 h-4 text-[#86868b] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>

              {/* Metadata row: Location, Lecturer, Group */}
              <div className="mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#86868b]">
                {(room || building) && (
                  <div className="flex items-center space-x-1.5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <MapPin className="w-3.5 h-3.5 text-[#fa243c] shrink-0" />
                    <span>
                      {room && <span className="font-semibold text-[#fa243c] mr-1">{room}</span>}
                      {building && (
                        <span className="text-[#86868b] font-normal">
                          {room ? `• ${building}` : building}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {lecturers && (
                  <div className="flex items-center space-x-1.5 text-[#86868b]">
                    <User className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                    <span className="truncate max-w-[240px] sm:max-w-none">
                      {lecturers}
                    </span>
                  </div>
                )}

                {act.group_number && (
                  <div className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#86868b]">
                    gr. {act.group_number}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* End of Day Completion Card */}
      <div className="pt-2 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl apple-glass border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868b]">
          <CalendarCheck className="w-3.5 h-3.5 text-[#34c759]" />
          <span>
            To wszystkie zajęcia zaplanowane na ten dzień ({sortedActivities.length} {sortedActivities.length === 1 ? 'blok' : 'bloków'})
          </span>
        </div>
      </div>
    </div>
  );
};

