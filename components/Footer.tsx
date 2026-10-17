'use client';

import React from 'react';
import { GraduationCap, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-auto border-t border-black/[0.04] dark:border-white/[0.06] apple-glass py-5 sm:py-6 text-[11px] text-[#86868b] pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-3.5 h-3.5 text-[#0071e3]" />
          <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
            Politechnika Rzeszowska im. Ignacego Łukasiewicza
          </span>
          <span>•</span>
          <span>Zaprojektowane przez QrinDev</span>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://buycoffee.to/qrin-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0071e3] flex items-center space-x-1 transition-colors"
          >
            <span>Wesprzyj Twórcę</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
