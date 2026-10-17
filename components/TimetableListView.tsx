'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Printer } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';

interface TimetableListViewProps {
  activities: USOSActivity[];
  onSelectActivity: (act: USOSActivity) => void;
}

export const TimetableListView: React.FC<TimetableListViewProps> = ({
  activities,
  onSelectActivity,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const sorted = [...activities].sort(
    (a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime()
  );

  return (
    <div className="apple-card rounded-3xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#fa243c]">
            Harmonogram Semestralny
          </span>
          <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">
            Wykaz Wszystkich Bloków Zajęciowych
          </h3>
          <p className="text-xs text-[#86868b] mt-0.5">
            Łącznie zaplanowano {sorted.length} {sorted.length === 1 ? 'blok zajęciowy' : 'bloków zajęciowych'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#86868b]" />
          <span>Drukuj plan</span>
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="py-16 text-center text-[#86868b] text-sm">
          Brak zaplanowanych zajęć do wyświetlenia.
        </div>
      ) : (
        <>
          <div className="block md:hidden divide-y divide-black/[0.04] dark:divide-white/[0.06]">
            {sorted.map((act, index) => {
              const start = parseDate(act.start_time);
              const end = parseDate(act.end_time);

              const isPast = end.getTime() < now.getTime();
              const isCurrent = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
              const baseColor = act.color || '#fa243c';

              const dayName = start.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'numeric' });
              const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const diffMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
              const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}m` : ''}`.trim();

              const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
              const classtype = typeof act.classtype_name === 'string' ? act.classtype_name : act.classtype_name?.pl || act.category || '';
              const room = act.room_number || '';
              const building = typeof act.building_name === 'string' ? act.building_name : act.building_name?.pl || '';
              const lecturers = act.lecturer_names?.join(', ') || 'Politechnika Rzeszowska';

              return (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
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

                        {act.group_number && (
                          <span className="font-mono text-[10px] text-[#86868b] bg-black/[0.04] dark:bg-white/[0.08] px-2 py-0.2 rounded-full">
                            Gr. {act.group_number}
                          </span>
                        )}

                        {isCurrent && (
                          <span className="flex items-center space-x-1 px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#fa243c] to-[#fb5c74] text-white shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>Teraz</span>
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-semibold leading-snug ${
                        isCurrent
                          ? 'text-[#fa243c]'
                          : isPast
                          ? 'text-[#86868b] line-through'
                          : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                      }`}>
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
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{room ? `Sala ${room}` : 'Sala —'}</span>
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
            })}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/[0.04] dark:border-white/[0.06] text-[#86868b] font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Przedmiot i Prowadzący</th>
                  <th className="py-3 px-4 font-medium">Dzień i Czas</th>
                  <th className="py-3 px-4 font-medium">Typ</th>
                  <th className="py-3 px-4 font-medium">Miejsce</th>
                  <th className="py-3 px-4 font-medium">Grupa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                {sorted.map((act, index) => {
                  const start = parseDate(act.start_time);
                  const end = parseDate(act.end_time);

                  const isPast = end.getTime() < now.getTime();
                  const isCurrent = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
                  const baseColor = act.color || '#fa243c';

                  const dayName = start.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric' });
                  const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  const diffMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                  const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}m` : ''}`.trim();

                  const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
                  const classtype = typeof act.classtype_name === 'string' ? act.classtype_name : act.classtype_name?.pl || act.category || '';
                  const room = act.room_number || '';
                  const building = typeof act.building_name === 'string' ? act.building_name : act.building_name?.pl || '';
                  const lecturers = act.lecturer_names?.join(', ') || 'Politechnika Rzeszowska';

                  return (
                    <tr
                      key={act.id}
                      onClick={() => onSelectActivity(act)}
                      className={`group cursor-pointer transition-colors duration-200 ${isCurrent
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
                          <span className="text-[#86868b] font-mono text-[11px]">
                            {index + 1}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className={`font-semibold transition-colors ${isCurrent
                            ? 'text-[#fa243c] font-bold'
                            : isPast
                              ? 'text-[#86868b]'
                              : 'text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#fa243c]'
                          }`}>
                          {name}
                        </div>
                        <div className="text-[11px] text-[#86868b] flex items-center space-x-1.5 mt-0.5">
                          <User className="w-3 h-3 opacity-70 shrink-0" />
                          <span className="truncate max-w-[240px]">{lecturers}</span>
                          {act.course_id && (
                            <span className="font-mono text-[10px] opacity-60">• {act.course_id}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-semibold capitalize ${isPast ? 'text-[#86868b]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'}`}>
                          {dayName}
                        </div>
                        <div className={`text-[11px] flex items-center space-x-1 mt-0.5 ${isPast ? 'line-through text-[#86868b]' : isCurrent ? 'text-[#fa243c] font-semibold' : 'text-[#86868b]'}`}>
                          <Clock className="w-3 h-3 mr-0.5 opacity-70" />
                          <span>{startTimeStr} – {endTimeStr}</span>
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
                        {act.group_number ? (
                          <span className="font-mono bg-black/[0.04] dark:bg-white/[0.08] px-2 py-0.5 rounded-full text-[#86868b]">
                            Gr. {act.group_number}
                          </span>
                        ) : (
                          <span className="text-[#86868b]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
