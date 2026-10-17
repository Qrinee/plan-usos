'use client';

import React from 'react';
import {
  Grid3X3,
  Columns,
  List,
  Image as ImageIcon,
  User,
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
  className?: string;
}

export const TimetableControls: React.FC<TimetableControlsProps> = ({
  viewMode,
  setViewMode,
  isLive = false,
  user = null,
  onOpenSettings,
  onOpenWallpaper,
  className = '',
}) => {
  return (
    <div
      className={`fixed bottom-8 sm:bottom-6 inset-x-0 mx-auto px-4 max-w-lg z-40 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom,0px)] md:hidden ${className}`}
    >
      <div className="pointer-events-auto flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-full bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.14] shadow-[0_16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.7)] ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
        {/* Segmented View Mode Switcher: Siatka | Dzień | Lista (Większy rozmiar) */}
        <div className="flex items-center p-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
          <button
            onClick={() => setViewMode('week')}
            className={`py-2 px-3.5 sm:px-4 min-h-[46px] rounded-full text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] dark:text-[#ff3b5c] shadow-sm font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
            title="Widok tygodnia (Siatka)"
            aria-label="Widok siatki"
          >
            <Grid3X3 className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
            <span>Siatka</span>
          </button>

          <button
            onClick={() => setViewMode('day')}
            className={`py-2 px-3.5 sm:px-4 min-h-[46px] rounded-full text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 cursor-pointer ${
              viewMode === 'day'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] dark:text-[#ff3b5c] shadow-sm font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
            title="Widok dnia"
            aria-label="Widok dnia"
          >
            <Columns className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
            <span>Dzień</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`py-2 px-3.5 sm:px-4 min-h-[46px] rounded-full text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#fa243c] dark:text-[#ff3b5c] shadow-sm font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
            title="Widok listy"
            aria-label="Widok listy"
          >
            <List className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
            <span>Lista</span>
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-black/[0.08] dark:bg-white/[0.14] mx-0.5 shrink-0" />

        {/* Quick Action Buttons: Wallpaper & Account (Większy rozmiar 48x48) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {onOpenWallpaper && (
            <button
              onClick={onOpenWallpaper}
              className="w-12 h-12 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#fa243c] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-90 transition-all cursor-pointer"
              title="Personalizacja tła i motywu"
              aria-label="Personalizuj tapetę i motyw"
            >
              <ImageIcon className="w-5.5 h-5.5" />
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="relative w-12 h-12 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-90 transition-all cursor-pointer"
              title={
                isLive
                  ? user
                    ? `Konto USOS: ${user.first_name} ${user.last_name}`
                    : 'Konto USOS'
                  : 'Połącz z USOS PRZ'
              }
              aria-label="Konto i ustawienia USOS"
            >
              <User className="w-5.5 h-5.5" />
              {/* Live Status indicator dot */}
              <span
                className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#1c1c1e] ${
                  isLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#fa243c]'
                }`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
