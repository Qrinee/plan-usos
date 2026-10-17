'use client';

import React from 'react';
import { Coffee } from 'lucide-react';
import { DaySummary } from '@/lib/utils/daySummary';

interface DayProgressBarProps {
  daySummary: DaySummary;
}

export const DayProgressBar: React.FC<DayProgressBarProps> = ({ daySummary }) => {
  if (daySummary.hasNoClassesToday) return null;

  return (
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
              <span>
                Okienka: {Math.floor(daySummary.totalGapMinutes / 60)}h{' '}
                {daySummary.totalGapMinutes % 60 ? `${daySummary.totalGapMinutes % 60}m` : ''}
              </span>
            </span>
          )}

          <span className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
            {daySummary.isDayFinished
              ? 'Koniec zajęć 🎉'
              : `Koniec o ${daySummary.dayEndsAtStr} (${daySummary.remainingTimeStr})`}
          </span>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#fa243c] via-[#fb5c74] to-[#34c759] transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${daySummary.progressPercent}%` }}
        />
      </div>
    </div>
  );
};
