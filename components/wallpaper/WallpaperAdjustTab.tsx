'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface WallpaperAdjustTabProps {
  bgBlur: number;
  onSetBgBlur: (val: number) => void;
  bgDim: number;
  onSetBgDim: (val: number) => void;
}

export const WallpaperAdjustTab: React.FC<WallpaperAdjustTabProps> = ({
  bgBlur,
  onSetBgBlur,
  bgDim,
  onSetBgDim,
}) => {
  return (
    <div className="space-y-4">
      {/* Blur Adjustment */}
      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Rozmycie tła (Glassmorphism)
          </span>
          <span className="font-mono text-[#86868b]">{bgBlur}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          step="1"
          value={bgBlur}
          onChange={(e) => onSetBgBlur(Number(e.target.value))}
          className="w-full accent-[#fa243c] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#86868b]">
          <span>Ostre (0px)</span>
          <span>Domyślne (8px)</span>
          <span>Mocne (24px)</span>
        </div>
      </div>

      {/* Dim / Opacity Adjustment */}
      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Przyciemnienie / Kontrast tekstu
          </span>
          <span className="font-mono text-[#86868b]">{bgDim}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="80"
          step="5"
          value={bgDim}
          onChange={(e) => onSetBgDim(Number(e.target.value))}
          className="w-full accent-[#fa243c] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#86868b]">
          <span>Jasne (0%)</span>
          <span>Zrównoważone (35%)</span>
          <span>Ciemne (80%)</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onSetBgBlur(8);
          onSetBgDim(35);
        }}
        className="w-full py-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Przywróć domyślne parametry (8px / 35%)</span>
      </button>
    </div>
  );
};
