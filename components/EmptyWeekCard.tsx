'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { USOSUser } from '@/lib/usos/types';

interface EmptyWeekCardProps {
  user: USOSUser | null;
  onNextWeek: () => void;
  onOpenSearch: () => void;
}

export const EmptyWeekCard: React.FC<EmptyWeekCardProps> = ({
  user,
  onNextWeek,
  onOpenSearch,
}) => {
  return (
    <div className="apple-card rounded-3xl p-6 sm:p-12 text-center shadow-xs space-y-3">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-[#fa243c]/10 text-[#fa243c] flex items-center justify-center">
        <Calendar className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          Brak zajęć w wybranym tygodniu
        </h3>
        <p className="text-xs text-[#86868b] mt-1 max-w-md mx-auto">
          Połączono z Twoim kontem USOS PRZ ({user?.first_name} {user?.last_name}). W tym tygodniu
          nie masz zaplanowanych zajęć.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          onClick={onNextWeek}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white font-medium text-xs transition-all shadow-md shadow-[#fa243c]/20 active:scale-95 cursor-pointer"
        >
          Sprawdź następny tydzień
        </button>
        <button
          onClick={onOpenSearch}
          className="px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-xs transition-all active:scale-95 cursor-pointer"
        >
          Katalog przedmiotów
        </button>
      </div>
    </div>
  );
};
