'use client';

import React from 'react';
import { DayItem } from './types';

interface DayTabButtonProps {
  day: DayItem;
  isSelected: boolean;
  onClick: () => void;
}

export const DayTabButton: React.FC<DayTabButtonProps> = ({
  day,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-between h-[66px] sm:h-[72px] w-full p-1.5 sm:p-2 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer relative ${isSelected
          ? 'bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-md shadow-[#fa243c]/25 font-semibold scale-[1.02]'
          : 'apple-card text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
        }`}
    >
      <div className="flex items-center space-x-1 text-[11px] sm:text-xs">
        <span>{day.short}</span>
        {day.isToday && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#fa243c] animate-pulse'
              }`}
          />
        )}
      </div>

      <span className="text-base sm:text-lg font-bold leading-none">{day.dayNum}</span>

      <span
        className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium truncate max-w-full text-center leading-none ${isSelected
            ? 'bg-white/20 text-white'
            : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b]'
          }`}
      >
        {day.weekOffset === 0
          ? day.count === 0
            ? 'brak'
            : `${day.count} ${day.count === 1 ? 'zaj.' : 'zajęć'}`
          : day.count > 0
            ? `${day.count} zaj.`
            : day.weekOffset < 0
              ? 'Poprz.'
              : 'Nast.'}
      </span>

      {isSelected && (
        <span className="absolute bottom-1 w-6 h-[2.5px] rounded-full bg-white shadow-xs" />
      )}
    </button>
  );
};
