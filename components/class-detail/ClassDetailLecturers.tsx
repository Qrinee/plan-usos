'use client';

import React from 'react';
import { GraduationCap, Mail, ExternalLink } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';

interface ClassDetailLecturersProps {
  activity: USOSActivity;
}

export const ClassDetailLecturers: React.FC<ClassDetailLecturersProps> = ({
  activity,
}) => {
  const hasLecturers = (activity.lecturers && activity.lecturers.length > 0) || (activity.lecturer_names && activity.lecturer_names.length > 0);
  if (!hasLecturers) return null;

  return (
    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04] space-y-3">
      <div className="space-y-2 pt-1">
        {activity.lecturers && activity.lecturers.length > 0 ? (
          activity.lecturers.map((lec, idx) => {
            const profileUrl = lec.id ? `https://usos.prz.edu.pl/kontroler.php?_action=katalog2/osoby/pokazOsobe&os_id=${encodeURIComponent(String(lec.id))}` : null;
            const displayName = lec.formatted_name || `${lec.first_name || ''} ${lec.last_name || ''}`.trim() || 'Wykładowca';

            return (
              <div
                key={lec.id || idx}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.02] dark:border-white/[0.03]"
              >
                <div className="w-8 h-8 rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                    {displayName}
                  </p>
                  {lec.email && (
                    <a
                      href={`mailto:${lec.email}`}
                      className="text-[11px] text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1 mt-1 truncate"
                    >
                      <Mail className="w-3 h-3 opacity-70 shrink-0" />
                      <span className="truncate">{lec.email}</span>
                    </a>
                  )}
                </div>

                {profileUrl && (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Otwórz profil w USOSweb"
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#fa243c]/15 hover:text-[#fa243c] text-[#86868b] text-[11px] font-medium transition-all shrink-0 active:scale-95"
                  >
                    <span>USOS</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>
            );
          })
        ) : (
          activity.lecturer_names?.map((lecName, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.02] dark:border-white/[0.03]"
            >
              <span className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                {lecName}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
