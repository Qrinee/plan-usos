'use client';

import React from 'react';
import {
  Settings,
  Moon,
  Sun,
  GraduationCap,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import { USOSUser } from '@/lib/usos/types';

interface NavbarProps {
  isLive: boolean;
  user: USOSUser | null;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenWallpaper: () => void;
  onExportICal: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLive,
  user,
  onOpenSettings,
  onOpenWallpaper,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="top-0 z-40 w-full apple-glass transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-15 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-gradient-to-tr from-[#fa243c] via-[#fb5c74] to-[#a855f7] flex items-center justify-center text-white shadow-sm shadow-[#fa243c]/20 shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
              Plan Zajęć
            </span>
            <span className="text-[10px] text-[#86868b] hidden xs:inline sm:hidden font-medium">
              Politechnika Rzeszowska
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center">
          {isLive && user && (
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/[0.08] dark:bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/[0.14] transition-all cursor-pointer"
            >
              <span>{user.first_name} {user.last_name}</span>
              {user.student_number && (
                <span className="text-emerald-600/70 dark:text-emerald-400/70 text-[11px]">({user.student_number})</span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 min-h-[36px] rounded-full bg-[#fa243c] hover:bg-[#e11d48] text-white text-xs font-medium transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="inline">{isLive ? 'Konto' : 'Połącz'}</span>
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-pwa-install'));
              }
            }}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#fa243c] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer"
            title="Zainstaluj aplikację na telefonie / komputerze"
            aria-label="Zainstaluj aplikację"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenWallpaper}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#fa243c] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer"
            title="Personalizuj tło (tapeta)"
            aria-label="Personalizuj tapetę"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer"
            title={darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
            aria-label={darkMode ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
