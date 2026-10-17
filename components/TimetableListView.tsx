'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Printer } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';
import { formatListItem } from './list-view/types';
import { ListViewMobileCard } from './list-view/ListViewMobileCard';
import { ListViewTableRow } from './list-view/ListViewTableRow';

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
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const sortedItems = useMemo(() => {
    return [...activities]
      .sort((a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime())
      .map((act) => formatListItem(act, now));
  }, [activities, now]);

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
            Łącznie zaplanowano {sortedItems.length}{' '}
            {sortedItems.length === 1 ? 'blok zajęciowy' : 'bloków zajęciowych'}
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

      {sortedItems.length === 0 ? (
        <div className="py-16 text-center text-[#86868b] text-sm">
          Brak zaplanowanych zajęć do wyświetlenia.
        </div>
      ) : (
        <>
          {/* Mobile view card stack */}
          <div className="block md:hidden divide-y divide-black/[0.04] dark:divide-white/[0.06]">
            {sortedItems.map((item, index) => (
              <ListViewMobileCard
                key={item.id}
                item={item}
                index={index}
                onSelect={onSelectActivity}
              />
            ))}
          </div>

          {/* Desktop view table */}
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
                {sortedItems.map((item, index) => (
                  <ListViewTableRow
                    key={item.id}
                    item={item}
                    index={index}
                    onSelect={onSelectActivity}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
