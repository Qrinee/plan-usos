'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Clock,
  ChevronRight,
  CalendarCheck,
  BookOpen,
  MapPin,
  Navigation,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Building2,
  Sparkles,
} from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';
import { computeDaySummary } from '@/lib/utils/daySummary';

interface UpcomingBannerProps {
  activities: USOSActivity[];
  onSelectActivity: (act: USOSActivity) => void;
}

export const UpcomingBanner: React.FC<UpcomingBannerProps> = ({
  activities,
  onSelectActivity,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isApple =
        /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsAppleDevice(isApple);
    }

    // Refresh every 10 seconds for real-time progress and timers
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const daySummary = useMemo(() => {
    return computeDaySummary(activities, now);
  }, [activities, now]);

  const nextInfo = useMemo(() => {
    if (!activities || activities.length === 0) return null;

    const sorted = [...activities].sort(
      (a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime()
    );

    const ongoing = sorted.find((act) => {
      const start = parseDate(act.start_time);
      const end = parseDate(act.end_time);
      return now >= start && now <= end;
    });

    if (ongoing) {
      const start = parseDate(ongoing.start_time);
      const end = parseDate(ongoing.end_time);
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = Math.max(0, now.getTime() - start.getTime());
      const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      const remainingMin = Math.max(1, Math.round((end.getTime() - now.getTime()) / (1000 * 60)));

      return {
        status: 'ongoing' as const,
        activity: ongoing,
        label: 'Zajęcia w toku',
        percent,
        elapsedStr: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        remainingStr: `pozostało ${remainingMin} min`,
        endStr: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const upcoming = sorted.find((act) => {
      const start = parseDate(act.start_time);
      return start > now;
    });

    if (upcoming) {
      const start = parseDate(upcoming.start_time);
      const end = parseDate(upcoming.end_time);
      const diffMs = start.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let timeNote = '';
      if (diffHours === 0) {
        timeNote = `za ${diffMins} min`;
      } else if (diffHours < 24) {
        timeNote = `za ${diffHours}h ${diffMins}min`;
      } else {
        const days = Math.round(diffHours / 24);
        timeNote = `za ${days} ${days === 1 ? 'dzień' : 'dni'}`;
      }

      return {
        status: 'upcoming' as const,
        activity: upcoming,
        label: 'Najbliższe zajęcia',
        percent: 0,
        elapsedStr: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        remainingStr: timeNote,
        endStr: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    return null;
  }, [activities, now]);

  if (!nextInfo && daySummary.hasNoClassesToday) {
    return (
      <div className="w-full apple-card rounded-3xl p-4 sm:p-5 flex items-center justify-between border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Dzień wolny od zajęć! ☀️
            </h4>
            <p className="text-xs text-[#86868b] mt-0.5">
              Brak zaplanowanych zajęć na dziś w Twoim harmonogramie.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const act = nextInfo?.activity;
  const name = act
    ? typeof act.name === 'string'
      ? act.name
      : act.name?.pl || 'Zajęcia'
    : 'Brak zajęć';

  const typeName = act
    ? typeof act.classtype_name === 'string'
      ? act.classtype_name
      : act.classtype_name?.pl || act.category || ''
    : '';

  const building = act
    ? typeof act.building_name === 'string'
      ? act.building_name
      : act.building_name?.pl || ''
    : '';

  const room = act?.room_number || '';
  const location = [building, room].filter(Boolean).join(' • ');
  const lecturers = act?.lecturer_names?.join(', ') || 'Politechnika Rzeszowska';
  const isOngoing = nextInfo?.status === 'ongoing';

  const transit = daySummary.transitInfo;

  return (
    <div className="w-full space-y-2.5">
      {/* 1. Main Live / Upcoming Class Card */}
      {act ? (
        <div
          onClick={() => onSelectActivity(act)}
          className="w-full cursor-pointer group apple-card rounded-3xl p-3.5 sm:p-5 hover:scale-[1.006] active:scale-[0.99] transition-all duration-300 relative overflow-hidden border border-black/[0.05] dark:border-white/[0.08] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-3.5 flex-1 min-w-0">
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-[#fa243c] via-[#fb5c74] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-[#fa243c]/25 shrink-0">
                {isOngoing ? (
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                ) : (
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isOngoing
                        ? 'bg-[#fa243c]/15 text-[#fa243c]'
                        : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#86868b]'
                    }`}
                  >
                    {nextInfo?.label}
                  </span>

                  {typeName && (
                    <span className="text-[10px] text-[#86868b] font-medium truncate">
                      • {typeName}
                    </span>
                  )}

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {nextInfo?.remainingStr}
                  </span>
                </div>

                <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7] truncate mt-0.5 group-hover:text-[#fa243c] transition-colors">
                  {name}
                </h3>

                <p className="text-xs text-[#86868b] truncate mt-0.5 flex items-center space-x-1.5">
                  <span>{lecturers}</span>
                  {location && <span>• {location}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <div className="flex items-center space-x-1 px-3 py-2 sm:px-3.5 sm:py-2 min-h-[36px] rounded-full bg-black/[0.04] dark:bg-white/[0.08] group-hover:bg-[#fa243c] group-hover:text-white text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] transition-all">
                <span className="hidden xs:inline">Szczegóły</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Ongoing class progress bar */}
          {isOngoing && (
            <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.05]">
              <div className="flex items-center justify-between text-[11px] text-[#86868b] mb-1 font-medium">
                <span>Trwa od {nextInfo?.elapsedStr}</span>
                <span>Koniec: {nextInfo?.endStr}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] rounded-full transition-all duration-700"
                  style={{ width: `${nextInfo?.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full apple-card rounded-3xl p-4 sm:p-5 flex items-center justify-between border border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Wszystkie zajęcia zakończone 🎉
              </h4>
              <p className="text-xs text-[#86868b] mt-0.5">
                Na dzisiaj to już koniec zajęć. Miłego odpoczynku!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Campus Transit Assistant (Przejście między budynkami) */}
      {transit && (
        <div
          className={`w-full rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 shadow-xs ${
            transit.urgency === 'critical'
              ? 'bg-rose-500/[0.08] border-rose-500/30 text-rose-700 dark:text-rose-300'
              : transit.urgency === 'tight'
              ? 'bg-amber-500/[0.08] border-amber-500/30 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  transit.urgency === 'critical'
                    ? 'bg-rose-500 text-white'
                    : transit.urgency === 'tight'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {transit.urgency === 'critical' ? (
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Asystent przejścia • Kampus PRz
                  </span>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      transit.urgency === 'critical'
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : transit.urgency === 'tight'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    Przerwa: {transit.breakMinutes} min • Spacer: ~{transit.walkingMinutes} min
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 mt-1 font-semibold text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <span className="truncate">{transit.fromBuilding.name} ({transit.fromRoom})</span>
                  <span>➔</span>
                  <span className="truncate">{transit.toBuilding.name} ({transit.toRoom})</span>
                </div>

                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                  {transit.note}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() =>
                  window.open(
                    isAppleDevice ? transit.appleMapsWalkUrl : transit.googleMapsWalkUrl,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 text-xs font-semibold shadow-xs border border-black/[0.08] dark:border-white/[0.1] active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#fa243c]" />
                <span>Nawiguj pieszo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Pasek Postępu Dnia (Day Progress & Stats Bar) */}
      {!daySummary.hasNoClassesToday && (
        <div className="w-full apple-card rounded-2xl p-3 sm:p-4 border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#86868b] mb-2 font-medium flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Postęp dnia: {daySummary.completedCount} z {daySummary.totalActivities} zajęć
              </span>
              <span className="text-black/20 dark:text-white/20">•</span>
              <span className="text-[#fa243c] font-bold">
                {daySummary.progressPercent}%
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              {daySummary.totalGapMinutes > 0 && (
                <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[11px]">
                  <Coffee className="w-3 h-3" />
                  <span>Okienka: {Math.floor(daySummary.totalGapMinutes / 60)}h {daySummary.totalGapMinutes % 60 ? `${daySummary.totalGapMinutes % 60}m` : ''}</span>
                </span>
              )}

              <span className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                {daySummary.isDayFinished
                  ? 'Koniec zajęć 🎉'
                  : `Koniec o ${daySummary.dayEndsAtStr} (${daySummary.remainingTimeStr})`}
              </span>
            </div>
          </div>

          {/* Progress bar container */}
          <div className="w-full h-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#fa243c] via-[#fb5c74] to-[#34c759] transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${daySummary.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
