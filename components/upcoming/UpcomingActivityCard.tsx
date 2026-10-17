'use client';

import React from 'react';
import { Clock, BookOpen, Coffee, CheckCircle2, ChevronRight } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { NextActivityInfo } from './types';

interface UpcomingActivityCardProps {
  nextInfo: NextActivityInfo | null;
  hasNoClassesToday: boolean;
  onSelectActivity: (act: USOSActivity) => void;
}

export const UpcomingActivityCard: React.FC<UpcomingActivityCardProps> = ({
  nextInfo,
  hasNoClassesToday,
  onSelectActivity,
}) => {
  if (!nextInfo && hasNoClassesToday) {
    return (
      <div className="w-full apple-card rounded-3xl p-4 sm:p-5 flex items-center justify-between border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Dzień wolny od zajęć!
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

  if (!act) {
    return (
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
    );
  }

  const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
  const typeName =
    typeof act.classtype_name === 'string'
      ? act.classtype_name
      : act.classtype_name?.pl || act.category || '';
  const building =
    typeof act.building_name === 'string' ? act.building_name : act.building_name?.pl || '';
  const room = act.room_number || '';
  const location = [building, room].filter(Boolean).join(' • ');
  const lecturers = act.lecturer_names?.join(', ') || 'Politechnika Rzeszowska';
  const isOngoing = nextInfo.status === 'ongoing';

  return (
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
                {nextInfo.label}
              </span>

              {typeName && (
                <span className="text-[10px] text-[#86868b] font-medium truncate">
                  • {typeName}
                </span>
              )}

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {nextInfo.remainingStr}
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

      {isOngoing && (
        <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.05]">
          <div className="flex items-center justify-between text-[11px] text-[#86868b] mb-1 font-medium">
            <span>Trwa od {nextInfo.elapsedStr}</span>
            <span>Koniec: {nextInfo.endStr}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] rounded-full transition-all duration-700"
              style={{ width: `${nextInfo.percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
