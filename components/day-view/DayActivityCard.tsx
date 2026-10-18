'use client';

import React from 'react';
import { MapPin, User } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { formatTime } from '@/lib/utils/date';
import { TimelineLayoutItem } from './types';

interface DayActivityCardProps {
  item: TimelineLayoutItem;
  now: Date;
  itemIdx: number;
  onSelect: (act: USOSActivity) => void;
}

export const DayActivityCard: React.FC<DayActivityCardProps> = ({
  item,
  now,
  itemIdx,
  onSelect,
}) => {
  const act = item.activity;
  const startStr = formatTime(item.start);
  const endStr = formatTime(item.end);

  const diffMin = Math.round((item.end.getTime() - item.start.getTime()) / (1000 * 60));
  const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}m` : ''}`.trim();

  const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
  const classtype =
    typeof act.classtype_name === 'string'
      ? act.classtype_name
      : act.classtype_name?.pl || act.category || '';
  const room = act.room_number || '';
  const building =
    typeof act.building_name === 'string' ? act.building_name : act.building_name?.pl || '';
  const lecturers = act.lecturer_names?.join(', ') || '';

  const isPast = item.end.getTime() < now.getTime();
  const isCurrent = now.getTime() >= item.start.getTime() && now.getTime() <= item.end.getTime();
  const baseColor = act.color || '#fa243c';

  const colWidthPercent = 100 / item.totalCols;
  const leftPercent = item.colIndex * colWidthPercent;

  return (
    <div
      onClick={() => onSelect(act)}
      className={`absolute rounded-2xl p-2 sm:p-2.5 transition-all duration-200 cursor-pointer overflow-hidden border shadow-xs hover:shadow-md active:scale-[0.99] group anim-item-card ${isCurrent
        ? 'bg-[#fa243c]/[0.1] dark:bg-[#fa243c]/[0.18] border-[#fa243c]/50 ring-2 ring-[#fa243c]/25'
        : isPast
          ? 'opacity-65 hover:opacity-100 bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08]'
          : 'apple-glass border-black/[0.08] dark:border-white/[0.12] hover:border-[#fa243c]/40'
        }`}
      style={{
        top: item.topPx + 2,
        height: Math.max(44, item.heightPx - 4),
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${colWidthPercent}% - 4px)`,
        borderLeftWidth: '4px',
        borderLeftColor: baseColor,
        animationDelay: `${Math.min(itemIdx * 40, 200)}ms`,
      }}
    >
      <div className="flex items-center justify-between gap-1 text-[11px] leading-tight">
        <div className="flex items-center space-x-1.5 font-semibold">
          <span
            className={
              isCurrent
                ? 'text-[#fa243c] font-bold'
                : isPast
                  ? 'text-[#86868b]'
                  : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
            }
          >
            {startStr} – {endStr}
          </span>
          <span className="text-[10px] text-[#86868b] font-normal hidden xs:inline">
            ({durationStr})
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {isCurrent && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-2xs">
              TRWA
            </span>
          )}
          {isPast && (
            <span className="text-[9px] text-[#86868b] px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08]">
              ✓
            </span>
          )}
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase truncate max-w-[65px]"
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
      <h4
        className={`font-semibold text-xs sm:text-sm mt-1 transition-colors leading-snug line-clamp-2 ${isCurrent
          ? 'text-[#1d1d1f] dark:text-[#f5f5f7] font-bold'
          : isPast
            ? 'text-[#86868b]'
            : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#fa243c]'
          }`}
      >
        {name}
      </h4>

      {/* Location & Lecturer Info */}
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#86868b]">
        {(building || room) && (
          <span className="flex items-center space-x-1 font-medium">
            <MapPin className="w-3 h-3 text-[#86868b] shrink-0" />
            <span className="truncate">{[room, building].filter(Boolean).join(' • ')}</span>
          </span>
        )}

        {lecturers && item.heightPx >= 55 && (
          <span className="flex items-center space-x-1 truncate max-w-full">
            <User className="w-3 h-3 text-[#86868b] shrink-0" />
            <span className="truncate">{lecturers}</span>
          </span>
        )}

        {act.group_number && (
          <span className="font-mono text-[10px] text-[#86868b]">
            gr. {act.group_number}
          </span>
        )}
      </div>
    </div>
  );
};
