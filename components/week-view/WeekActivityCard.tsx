'use client';

import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';
import { WEEK_HOUR_HEIGHT } from './types';

interface WeekActivityCardProps {
  activity: USOSActivity;
  startHour: number;
  now: Date;
  onSelect: (act: USOSActivity) => void;
}

export const WeekActivityCard: React.FC<WeekActivityCardProps> = ({
  activity,
  startHour,
  now,
  onSelect,
}) => {
  const start = parseDate(activity.start_time);
  const end = parseDate(activity.end_time);

  const startDec = start.getHours() + start.getMinutes() / 60;
  const endDec = end.getHours() + end.getMinutes() / 60;

  const top = Math.max(0, (startDec - startHour) * WEEK_HOUR_HEIGHT);
  const height = Math.max(48, (endDec - startDec) * WEEK_HOUR_HEIGHT);

  const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const name = typeof activity.name === 'string' ? activity.name : activity.name?.pl || 'Zajęcia';
  const classtype =
    typeof activity.classtype_name === 'string'
      ? activity.classtype_name
      : activity.classtype_name?.pl || activity.category || '';
  const room = activity.room_number || '';

  const isPast = end.getTime() < now.getTime();
  const isCurrent = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
  const baseColor = activity.color || '#0071e3';

  return (
    <div
      onClick={() => onSelect(activity)}
      className={`absolute left-1 right-1 rounded-2xl p-2 sm:p-2.5 cursor-pointer backdrop-blur-md overflow-hidden flex flex-col justify-between border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isCurrent
          ? 'border-[#fa243c] ring-2 ring-[#fa243c]/30 shadow-lg shadow-[#fa243c]/15 scale-[1.01] z-20'
          : isPast
            ? 'opacity-40 hover:opacity-100 grayscale-[40%] hover:grayscale-0 shadow-none border-dashed border-black/10 dark:border-white/10'
            : 'shadow-xs hover:shadow-md hover:scale-[1.01] hover:z-20'
      }`}
      style={{
        top: `${top + 2}px`,
        height: `${height - 4}px`,
        backgroundColor: isCurrent
          ? 'rgba(250, 36, 60, 0.12)'
          : isPast
            ? 'rgba(0, 0, 0, 0.02)'
            : `${baseColor}14`,
        borderColor: isCurrent ? '#fa243c' : isPast ? undefined : `${baseColor}30`,
        borderLeftWidth: '3.5px',
        borderLeftColor: isCurrent ? '#fa243c' : isPast ? '#86868b' : baseColor,
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-1 text-[10px] font-medium mb-1">
          <span
            className={`flex items-center text-[10px] truncate ${
              isPast
                ? 'text-[#86868b] line-through'
                : isCurrent
                  ? 'text-[#fa243c] font-semibold'
                  : 'text-[#86868b]'
            }`}
          >
            <Clock className="w-2.5 h-2.5 mr-1 shrink-0 opacity-70" />
            <span className="truncate">
              {startTimeStr} – {endTimeStr}
            </span>
          </span>

          {isCurrent && (
            <span className="px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider text-[8px] bg-[#fa243c] text-white shrink-0 shadow-2xs">
              TERAZ
            </span>
          )}

          {!isCurrent && classtype && (
            <span
              className="px-1.5 py-0.2 rounded-full font-medium text-[9px] truncate max-w-[70px] shrink-0"
              style={{
                backgroundColor: isPast ? 'rgba(134, 134, 139, 0.1)' : `${baseColor}20`,
                color: isPast ? '#86868b' : baseColor,
              }}
            >
              {classtype}
            </span>
          )}
        </div>

        <h4
          className={`font-semibold text-xs leading-tight line-clamp-2 transition-colors ${
            isCurrent
              ? 'text-[#fa243c] dark:text-[#fb5c74] font-bold'
              : isPast
                ? 'text-[#86868b]'
                : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
          }`}
        >
          {name}
        </h4>

        {activity.lecturer_names?.[0] && height >= 80 && (
          <p className="text-[10px] text-[#86868b] truncate mt-1 flex items-center">
            <User className="w-2.5 h-2.5 mr-1 shrink-0 opacity-70" />
            <span className="truncate">{activity.lecturer_names[0]}</span>
          </p>
        )}
      </div>

      {height >= 65 && (
        <div className="mt-1 flex items-center justify-between text-[10px] text-[#86868b] pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
          {room ? (
            <span className="flex items-center font-medium truncate max-w-[80%] text-[10px]">
              <MapPin className="w-2.5 h-2.5 mr-0.5 text-[#86868b] shrink-0" />
              <span className="truncate">{room}</span>
            </span>
          ) : (
            <span />
          )}

          {activity.group_number && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] shrink-0">
              Gr.{activity.group_number}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
