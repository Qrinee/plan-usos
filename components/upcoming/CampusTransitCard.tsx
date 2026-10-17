'use client';

import React from 'react';
import { AlertTriangle, Navigation, Compass } from 'lucide-react';
import { TransitAnalysis } from '@/lib/utils/transit';

interface CampusTransitCardProps {
  transit: TransitAnalysis;
  isAppleDevice: boolean;
}

export const CampusTransitCard: React.FC<CampusTransitCardProps> = ({
  transit,
  isAppleDevice,
}) => {
  const isCritical = transit.urgency === 'critical';
  const isTight = transit.urgency === 'tight';

  return (
    <div
      className={`w-full rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 shadow-xs ${
        isCritical
          ? 'bg-rose-500/[0.08] border-rose-500/30 text-rose-700 dark:text-rose-300'
          : isTight
            ? 'bg-amber-500/[0.08] border-amber-500/30 text-amber-700 dark:text-amber-300'
            : 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isCritical
                ? 'bg-rose-500 text-white'
                : isTight
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
            }`}
          >
            {isCritical ? (
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
                  isCritical
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                    : isTight
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
  );
};
