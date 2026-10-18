'use client';

import React from 'react';
import { X, Clock } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';

interface ClassDetailHeaderProps {
  activity: USOSActivity;
  onClose: () => void;
}

export const ClassDetailHeader: React.FC<ClassDetailHeaderProps> = ({
  activity,
  onClose,
}) => {
  const start = parseDate(activity.start_time);
  const end = parseDate(activity.end_time);

  const dayFormatted = start.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diffMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}min` : ''}`.trim();

  const name = typeof activity.name === 'string' ? activity.name : activity.name?.pl || 'Zajęcia';
  const nameEn = typeof activity.name === 'object' ? activity.name?.en : undefined;

  const classtype =
    typeof activity.classtype_name === 'string'
      ? activity.classtype_name
      : activity.classtype_name?.pl || activity.category || 'Zajęcia';

  const baseColor = activity.color || '#fa243c';

  return (
    <div className="p-5 sm:p-6 relative border-b border-black/[0.04] dark:border-white/[0.06]">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 sm:right-5 sm:top-5 w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-all cursor-pointer"
        aria-label="Zamknij"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center space-x-2 text-xs">
        <span
          className="px-2.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: `${baseColor}15`, color: baseColor }}
        >
          {classtype}
        </span>
        {activity.group_number && (
          <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] font-mono text-[11px]">
            Grupa {activity.group_number}
          </span>
        )}
      </div>

      <h2 className="text-lg sm:text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-2.5 leading-snug">
        {name}
      </h2>
      {nameEn && <p className="text-xs text-[#86868b] mt-0.5">{nameEn}</p>}

      <div className="flex items-center space-x-2 text-xs text-[#86868b] mt-3">
        <span className="flex items-center font-medium capitalize text-[#1d1d1f] dark:text-[#f5f5f7]">
          <Clock className="w-3.5 h-3.5 mr-1 text-[#fa243c]" />
          {dayFormatted}
        </span>
        <span>•</span>
        <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          {startTimeStr} – {endTimeStr}
        </span>
        <span>({durationStr})</span>
      </div>
    </div>
  );
};
