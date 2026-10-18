'use client';

import React from 'react';
import { Info } from 'lucide-react';

export const ApiSecurityNote: React.FC = () => {
  return (
    <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] text-[#86868b] text-[11px] space-y-1">
      <div className="flex items-center space-x-1 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
        <Info className="w-3.5 h-3.5 text-[#fa243c]" />
        <span>Bezpieczeństwo autoryzacji</span>
      </div>
      <p>
        Aplikacja korzysta z oficjalnego protokołu OAuth 1.0a USOS PRZ. Twoje hasło logowania nigdy nie trafia do tej aplikacji – logujesz się bezpiecznie na stronie uczelni (usosapps.prz.edu.pl).
      </p>
    </div>
  );
};
