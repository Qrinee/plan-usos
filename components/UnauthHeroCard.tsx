'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';

interface UnauthHeroCardProps {
  onConnect: () => void;
}

export const UnauthHeroCard: React.FC<UnauthHeroCardProps> = ({ onConnect }) => {
  return (
    <div className="py-12 sm:py-20 max-w-xl mx-auto text-center space-y-6 animate-in fade-in duration-500">
      <div className="apple-card rounded-3xl p-8 sm:p-10 shadow-xl space-y-5 border border-black/[0.05] dark:border-white/[0.08] relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#fa243c] via-[#fb5c74] to-[#a855f7] text-white flex items-center justify-center shadow-lg shadow-[#fa243c]/25">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
            Plan Zajęć Politechniki Rzeszowskiej
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b] mt-2 leading-relaxed max-w-md mx-auto">
            Zaloguj się swoim kontem uczelnianym USOS PRZ, aby uzyskać bezpośredni dostęp do swojego
            oficjalnego planu zajęć, sal wykładowych i bieżących przedmiotów.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onConnect}
            className="px-7 py-3 cursor-pointer rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-[#fa243c]/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            Połącz konto USOS PRZ
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={() => window.open('https://buycoffee.to/qrin-dev', '_blank')}
            className="px-7 py-3 rounded-full hover:opacity-95 font-semibold text-xs border cursor-pointer sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            ☕ Wesprzyj Twórcę
          </button>
        </div>

        <p className="text-[11px] text-[#86868b] pt-1">
          Bezpieczna autoryzacja OAuth 1.0a bezpośrednio przez serwery USOS PRZ
        </p>
      </div>
    </div>
  );
};
