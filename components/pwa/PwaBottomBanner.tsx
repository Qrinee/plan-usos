'use client';

import React from 'react';
import { Download, X } from 'lucide-react';

interface PwaBottomBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const PwaBottomBanner: React.FC<PwaBottomBannerProps> = ({
  onInstall,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm apple-glass rounded-2xl p-3 sm:p-3.5 border border-black/[0.08] dark:border-white/[0.1] shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fa243c] to-[#fb5c74] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#fa243c]/30">
          <Download className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
            Zainstaluj aplikację
          </h4>
          <p className="text-[11px] text-[#86868b] truncate">
            Plan lekcji offline na Twoim ekranie
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={onInstall}
          className="px-3 py-1.5 rounded-full bg-[#fa243c] hover:bg-[#e11d48] text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          Zainstaluj
        </button>
        <button
          onClick={onDismiss}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Zamknij"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
