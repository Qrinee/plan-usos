'use client';

import React from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { WALLPAPER_PRESETS } from './presets';

interface WallpaperPresetsTabProps {
  customBg: string | null;
  onSetCustomBg: (url: string | null) => void;
}

export const WallpaperPresetsTab: React.FC<WallpaperPresetsTabProps> = ({
  customBg,
  onSetCustomBg,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onSetCustomBg(null)}
          className={`group relative rounded-2xl p-2.5 flex flex-col items-center justify-center text-center border transition-all duration-300 aspect-[4/3] cursor-pointer ${
            customBg === null
              ? 'border-[#fa243c] bg-[#fa243c]/[0.08] ring-2 ring-[#fa243c]/30 shadow-md'
              : 'border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#86868b] group-hover:text-[#fa243c] transition-colors mb-1.5">
            <RotateCcw className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Domyślne
          </span>
          <span className="text-[10px] text-[#86868b]">Apple Glass</span>
          {customBg === null && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#fa243c] text-white flex items-center justify-center shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </button>

        {WALLPAPER_PRESETS.map((preset) => {
          const isSelected = customBg === preset.url;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSetCustomBg(preset.url)}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 aspect-[4/3] text-left cursor-pointer ${
                isSelected
                  ? 'border-[#fa243c] ring-2 ring-[#fa243c]/30 shadow-md scale-[1.02]'
                  : 'border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <img
                src={preset.thumb}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                <span className="text-[10px] text-white/70 font-medium leading-none">
                  {preset.category}
                </span>
                <span className="text-xs font-semibold text-white truncate mt-0.5">
                  {preset.name}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#fa243c] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
