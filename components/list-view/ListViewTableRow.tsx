'use client';

import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { FormattedListItem } from './types';

interface ListViewTableRowProps {
  item: FormattedListItem;
  index: number;
  onSelect: (act: USOSActivity) => void;
}

export const ListViewTableRow: React.FC<ListViewTableRowProps> = ({
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
    dayNameShort,
    startTimeStr,
    endTimeStr,
    durationStr,
    isPast,
    isCurrent,
    baseColor,
    groupNumber,
    courseId,
  } = item;

  return (
    <tr
      onClick={() => onSelect(activity)}
      className={`group cursor-pointer transition-colors duration-200 ${
        isCurrent
          ? 'bg-[#fa243c]/[0.08] dark:bg-[#fa243c]/[0.12]'
          : isPast
            ? 'opacity-40 hover:opacity-100 grayscale-[35%] hover:grayscale-0'
            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
      }`}
    >
      <td className="py-3.5 px-3 text-center whitespace-nowrap">
        {isCurrent ? (
          <div className="flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#fa243c] animate-ping" />
          </div>
        ) : (
          <span className="text-[#86868b] font-mono text-[11px]">{index + 1}</span>
        )}
      </td>

      <td className="py-3.5 px-4 min-w-[200px]">
        <div
          className={`font-semibold transition-colors ${
            isCurrent
              ? 'text-[#fa243c] font-bold'
              : isPast
                ? 'text-[#86868b]'
                : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#fa243c]'
          }`}
        >
          {name}
        </div>
        <div className="text-[11px] text-[#86868b] flex items-center space-x-1.5 mt-0.5">
          <User className="w-3 h-3 opacity-70 shrink-0" />
          <span className="truncate max-w-[240px]">{lecturers}</span>
          {courseId && (
            <span className="font-mono text-[10px] opacity-60">• {courseId}</span>
          )}
        </div>
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        <div
          className={`font-semibold capitalize ${
            isPast ? 'text-[#86868b]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
          }`}
        >
          {dayNameShort}
        </div>
        <div
          className={`text-[11px] flex items-center space-x-1 mt-0.5 ${
            isPast
              ? 'line-through text-[#86868b]'
              : isCurrent
                ? 'text-[#fa243c] font-semibold'
                : 'text-[#86868b]'
          }`}
        >
          <Clock className="w-3 h-3 mr-0.5 opacity-70" />
          <span>
            {startTimeStr} – {endTimeStr}
          </span>
          <span className="text-[10px] opacity-60">({durationStr})</span>
        </div>
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        <span
          className="px-2.5 py-0.5 rounded-full font-medium text-[10px]"
          style={{
            backgroundColor: isPast ? 'rgba(134, 134, 139, 0.1)' : `${baseColor}15`,
            color: isPast ? '#86868b' : baseColor,
          }}
        >
          {classtype}
        </span>
      </td>

      <td className="py-3.5 px-4">
        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center">
          <MapPin className="w-3 h-3 mr-1 text-[#86868b] shrink-0" />
          {room || '—'}
        </div>
        {building && (
          <div className="text-[11px] text-[#86868b] truncate max-w-xs mt-0.5">
            {building}
          </div>
        )}
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        {groupNumber ? (
          <span className="font-mono bg-black/[0.04] dark:bg-white/[0.08] px-2 py-0.5 rounded-full text-[#86868b]">
            Gr. {groupNumber}
          </span>
        ) : (
          <span className="text-[#86868b]">—</span>
        )}
      </td>
    </tr>
  );
};
