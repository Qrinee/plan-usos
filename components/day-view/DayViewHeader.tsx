'use client';

import React from 'react';
import { Clock, Rows3, Sparkles } from 'lucide-react';
import { formatTime } from '@/lib/utils/date';
import { DayItem } from './types';

interface DayViewHeaderProps {
  activeDay?: DayItem;
  activityCount: number;
  isNavigatingWeek: boolean;
  now: Date;
  layoutMode?: 'agenda' | 'timeline';
  onLayoutModeChange?: (mode: 'agenda' | 'timeline') => void;
}

export const DayViewHeader: React.FC<DayViewHeaderProps> = ({
  activeDay,
  activityCount,
  isNavigatingWeek,
  now,
  layoutMode = 'agenda',
  onLayoutModeChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
          <span>{activeDay?.name}</span>
          <span className="text-xs font-normal text-[#86868b]">
            ({activeDay?.date.toLocaleDateString('pl-PL', {
              day: 'numeric',
              month: 'short',
            })})
          </span>
        </h3>
        <p className="text-[11px] text-[#86868b] mt-0.5">
          {activityCount === 0
            ? 'Dzień wolny od zajęć dydaktycznych'
            : `${activityCount} ${activityCount === 1 ? 'blok zajęć' : 'bloków zajęć'}`}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {/* Today Clock Pill */}
        {activeDay?.isToday && !isNavigatingWeek && (
          <div className="hidden xs:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#fa243c]/10 text-[#fa243c] text-[11px] font-semibold shrink-0">
            <span>Dziś • {formatTime(now)}</span>
          </div>
        )}

        {isNavigatingWeek && (
          <span className="text-[11px] text-[#fa243c] font-medium flex items-center space-x-1 animate-pulse">
            <span>Ładowanie...</span>
          </span>
        )}

        {/* View Mode Switcher: Agenda (Karty) vs Timeline (Oś czasu) */}
        {onLayoutModeChange && (
          <div className="flex items-center p-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-xs">
            <button
              onClick={() => onLayoutModeChange('agenda')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                layoutMode === 'agenda'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] shadow-xs font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
              title="Widok agendy (pełne karty zajęć)"
              aria-label="Widok agendy"
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Karty</span>
            </button>
            <button
              onClick={() => onLayoutModeChange('timeline')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                layoutMode === 'timeline'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] shadow-xs font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
              title="Widok osi czasu (siatka godzinowa)"
              aria-label="Widok osi czasu"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px]">Oś czasu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
