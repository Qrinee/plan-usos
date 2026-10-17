'use client';

import React from 'react';
import {
  Grid3X3,
  Columns,
  List,
  Image as ImageIcon,
  Moon,
  Sun,
  User,
  Search,
} from 'lucide-react';
import { USOSUser } from '@/lib/usos/types';

export type ViewMode = 'week' | 'day' | 'list';

export interface TimetableControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isLive?: boolean;
  user?: USOSUser | null;
  onOpenSettings?: () => void;
  onOpenWallpaper?: () => void;
  onOpenSearch?: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  isNavigatingWeek?: boolean;
  baseMonday?: Date;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  className?: string;
}

export const TimetableControls: React.FC<TimetableControlsProps> = ({
  viewMode,
  setViewMode,
  isLive = false,
  user = null,
  onOpenSettings,
  onOpenWallpaper,
  onOpenSearch,
  darkMode = false,
  setDarkMode,
  className = '',
}) => {
  return (
    <div
      className={`fixed bottom-15 sm:bottom-5 inset-x-0 mx-auto px-3 max-w-lg z-40 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom,0px)] md:hidden ${className}`}
    >
      <div className="pointer-events-auto flex items-center justify-between gap-1 sm:gap-2 p-1.5 rounded-full bg-white/85 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
        {/* Segmented View Mode Switcher: Siatka | Dzień | Lista */}
        <div className="flex items-center p-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
          <button
            onClick={() => setViewMode('week')}
            className={`py-1.5 px-2.5 sm:px-3 min-h-[34px] rounded-full text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${viewMode === 'week'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] dark:text-[#ff3b5c] shadow-xs font-semibold scale-[1.02]'
              : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            title="Widok tygodnia (Siatka)"
            aria-label="Widok siatki"
          >
            <Grid3X3 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Siatka</span>
          </button>

          <button
            onClick={() => setViewMode('day')}
            className={`py-1.5 px-2.5 sm:px-3 min-h-[34px] rounded-full text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${viewMode === 'day'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] dark:text-[#ff3b5c] shadow-xs font-semibold scale-[1.02]'
              : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            title="Widok dnia"
            aria-label="Widok dnia"
          >
            <Columns className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Dzień</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`py-1.5 px-2.5 sm:px-3 min-h-[34px] rounded-full text-xs font-medium flex items-center justify-center space-x-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${viewMode === 'list'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] dark:text-[#ff3b5c] shadow-xs font-semibold scale-[1.02]'
              : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            title="Widok listy"
            aria-label="Widok listy"
          >
            <List className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Lista</span>
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-black/[0.08] dark:bg-white/[0.12] mx-0.5 shrink-0" />

        {/* Quick Action Buttons for Mobile */}
        <div className="flex items-center space-x-0.5 sm:space-x-1 shrink-0">


          {onOpenWallpaper && (
            <button
              onClick={onOpenWallpaper}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#fa243c] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-90 transition-all cursor-pointer"
              title="Personalizuj tło (tapeta)"
              aria-label="Personalizuj tapetę"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          )}

          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-90 transition-all cursor-pointer"
              title={darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
              aria-label="Przełącz motyw"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-90 transition-all cursor-pointer"
              title={
                isLive
                  ? user
                    ? `Konto USOS: ${user.first_name} ${user.last_name}`
                    : 'Konto USOS'
                  : 'Połącz z USOS PRZ'
              }
              aria-label="Konto i ustawienia USOS"
            >
              <User className="w-4 h-4" />
              {/* Live Status indicator dot */}
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#1c1c1e] ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#fa243c]'
                  }`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
