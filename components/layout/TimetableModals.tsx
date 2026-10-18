'use client';

import React from 'react';
import { USOSActivity, USOSUser } from '@/lib/usos/types';
import { ClassDetailModal } from '@/components/ClassDetailModal';
import { ApiSettingsModal } from '@/components/ApiSettingsModal';
import { CourseSearchModal } from '@/components/CourseSearchModal';
import { WallpaperModal } from '@/components/WallpaperModal';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';

interface TimetableModalsProps {
  selectedActivity: USOSActivity | null;
  onCloseActivity: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  isLive: boolean;
  user: USOSUser | null;
  onLogout: () => void;
  onRefreshAuth: () => void;
  isSearchOpen: boolean;
  onCloseSearch: () => void;
  isWallpaperModalOpen: boolean;
  onCloseWallpaper: () => void;
  customBg: string | null;
  onSetCustomBg: (url: string | null) => void;
  bgBlur: number;
  onSetBgBlur: (val: number) => void;
  bgDim: number;
  onSetBgDim: (val: number) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const TimetableModals: React.FC<TimetableModalsProps> = ({
  selectedActivity,
  onCloseActivity,
  isSettingsOpen,
  onCloseSettings,
  isLive,
  user,
  onLogout,
  onRefreshAuth,
  isSearchOpen,
  onCloseSearch,
  isWallpaperModalOpen,
  onCloseWallpaper,
  customBg,
  onSetCustomBg,
  bgBlur,
  onSetBgBlur,
  bgDim,
  onSetBgDim,
  darkMode,
  setDarkMode,
}) => {
  return (
    <>
      <ClassDetailModal
        activity={selectedActivity}
        onClose={onCloseActivity}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        isLive={isLive}
        user={user}
        onLogout={onLogout}
        onRefresh={onRefreshAuth}
      />

      <CourseSearchModal
        isOpen={isSearchOpen}
        onClose={onCloseSearch}
      />

      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={onCloseWallpaper}
        customBg={customBg}
        onSetCustomBg={onSetCustomBg}
        bgBlur={bgBlur}
        onSetBgBlur={onSetBgBlur}
        bgDim={bgDim}
        onSetBgDim={onSetBgDim}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <PwaInstallPrompt />
    </>
  );
};
