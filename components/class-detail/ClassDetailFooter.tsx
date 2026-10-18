'use client';

import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

interface ClassDetailFooterProps {
  onDownloadICal: () => void;
  usoswebUrl: string;
}

export const ClassDetailFooter: React.FC<ClassDetailFooterProps> = ({
  onDownloadICal,
  usoswebUrl,
}) => {
  return (
    <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
      <button
        type="button"
        onClick={onDownloadICal}
        className="flex items-center space-x-1.5 px-3.5 py-2 min-h-[40px] rounded-full hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] active:scale-95 transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#fa243c]" />
        <span>Pobierz .ics</span>
      </button>

      <a
        href={usoswebUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-1.5 px-4 py-2 min-h-[40px] rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white text-xs font-medium transition-all shadow-md shadow-[#fa243c]/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        <span>Otwórz w USOSweb</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
