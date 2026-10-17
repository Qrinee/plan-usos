'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { WALLPAPER_PRESETS, WallpaperPreset } from './wallpaper/presets';
import { WallpaperPresetsTab } from './wallpaper/WallpaperPresetsTab';
import { WallpaperCustomTab } from './wallpaper/WallpaperCustomTab';
import { WallpaperAdjustTab } from './wallpaper/WallpaperAdjustTab';

export { WALLPAPER_PRESETS };
export type { WallpaperPreset };

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  customBg: string | null;
  onSetCustomBg: (url: string | null) => void;
  bgBlur: number;
  onSetBgBlur: (val: number) => void;
  bgDim: number;
  onSetBgDim: (val: number) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  customBg,
  onSetCustomBg,
  bgBlur,
  onSetBgBlur,
  bgDim,
  onSetBgDim,
  darkMode,
  setDarkMode,
}) => {
  const [tab, setTab] = useState<'presets' | 'custom' | 'adjust'>('presets');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResetToDefault = () => {
    onSetCustomBg(null);
    onSetBgBlur(8);
    onSetBgDim(35);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg apple-card rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 relative border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#fa243c] to-[#fb5c74] text-white flex items-center justify-center shadow-xs">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Personalizacja Tła i Motywu
              </h2>
              <p className="text-xs text-[#86868b]">
                Dostosuj motyw aplikacji, tapetę oraz efekty
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wybór motywu: Jasny / Ciemny */}
        {setDarkMode && darkMode !== undefined && (
          <div className="px-4 sm:px-5 pt-3.5 pb-3 border-b border-black/[0.04] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Motyw aplikacji
              </span>
              <span className="text-[11px] font-medium text-[#86868b]">
                {darkMode ? 'Tryb ciemny aktywny' : 'Tryb jasny aktywny'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl border text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                  !darkMode
                    ? 'border-[#fa243c] bg-[#fa243c]/10 text-[#fa243c] font-semibold shadow-xs'
                    : 'border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[#86868b]'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Tryb Jasny</span>
              </button>

              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl border text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                  darkMode
                    ? 'border-[#fa243c] bg-[#fa243c]/10 text-[#fa243c] font-semibold shadow-xs'
                    : 'border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[#86868b]'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Tryb Ciemny</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-4 pt-3 pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="apple-segmented-container grid grid-cols-3 p-0.5">
            <button
              type="button"
              onClick={() => setTab('presets')}
              className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                tab === 'presets'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <span>Galeria</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('custom')}
              className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                tab === 'custom'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <span>Własne tło</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('adjust')}
              className={`py-1.5 px-3 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                tab === 'adjust'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Efekty</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {tab === 'presets' && (
            <WallpaperPresetsTab
              customBg={customBg}
              onSetCustomBg={onSetCustomBg}
            />
          )}

          {tab === 'custom' && (
            <WallpaperCustomTab
              onSetCustomBg={onSetCustomBg}
            />
          )}

          {tab === 'adjust' && (
            <WallpaperAdjustTab
              bgBlur={bgBlur}
              onSetBgBlur={onSetBgBlur}
              bgDim={bgDim}
              onSetBgDim={onSetBgDim}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetuj tło</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-xs font-semibold text-white shadow-sm shadow-[#fa243c]/20 transition-all active:scale-95 cursor-pointer"
          >
            Zapisz i zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
