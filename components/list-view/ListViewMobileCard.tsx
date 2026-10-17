'use client';

import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { FormattedListItem } from './types';

interface ListViewMobileCardProps {
  item: FormattedListItem;
  index: number;
  onSelect: (act: USOSActivity) => void;
}

export const ListViewMobileCard: React.FC<ListViewMobileCardProps> = ({
  item,
  index,
  onSelect,
}) => {
  const {
    activity,
    name,
    classtype,
    room,
    building,
    lecturers,
    dayName,
    startTimeStr,
    endTimeStr,
    isPast,
    isCurrent,
    baseColor,
    groupNumber,
  } = item;

  return (
    <div
      onClick={() => onSelect(activity)}
      className={`p-4 transition-all active:scale-[0.98] cursor-pointer ${
        isCurrent
          ? 'bg-[#fa243c]/[0.08] dark:bg-[#fa243c]/[0.14]'
          : isPast
            ? 'opacity-45 hover:opacity-100 grayscale-[35%] hover:grayscale-0'
            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-1">
            <span
              className="px-2 py-0.5 rounded-full font-semibold text-[10px] shrink-0"
              style={{
                backgroundColor: isPast ? 'rgba(134, 134, 139, 0.12)' : `${baseColor}15`,
                color: isPast ? '#86868b' : baseColor,
              }}
            >
              {classtype}
            </span>

            {groupNumber && (
              <span className="font-mono text-[10px] text-[#86868b] bg-black/[0.04] dark:bg-white/[0.08] px-2 py-0.2 rounded-full">
                Gr. {groupNumber}
              </span>
            )}

            {isCurrent && (
              <span className="flex items-center space-x-1 px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Teraz</span>
              </span>
            )}
          </div>

          <h4
            className={`text-sm font-semibold leading-snug ${
              isCurrent
                ? 'text-[#fa243c]'
                : isPast
                  ? 'text-[#86868b] line-through'
                  : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
            }`}
          >
            {name}
          </h4>
        </div>

        <span className="text-xs text-[#86868b] font-mono shrink-0 pt-0.5">
          #{index + 1}
        </span>
      </div>

      <div className="mt-2.5 pt-2 border-t border-black/[0.03] dark:border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
        <div className="flex items-center space-x-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
          <Clock className="w-3.5 h-3.5 text-[#fa243c] shrink-0" />
          <span className="font-medium capitalize">{dayName}</span>
          <span className="text-[#86868b]">({startTimeStr} – {endTimeStr})</span>
        </div>

        <div className="flex items-center space-x-1.5 text-[#86868b] truncate">
          <MapPin className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
          <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
            {room ? `Sala ${room}` : 'Sala —'}
          </span>
          {building && <span className="truncate">• {building}</span>}
        </div>

        {lecturers && (
          <div className="flex items-center space-x-1.5 text-[#86868b] sm:col-span-2 truncate">
            <User className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
            <span className="truncate">{lecturers}</span>
          </div>
        )}
      </div>
    </div>
  );
};
