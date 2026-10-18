'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { TimetableControls } from '@/components/TimetableControls';
import { TimetableWeekView } from '@/components/TimetableWeekView';
import { TimetableDayView } from '@/components/TimetableDayView';
import { TimetableListView } from '@/components/TimetableListView';
import { UnauthHeroCard } from '@/components/UnauthHeroCard';
import { EmptyWeekCard } from '@/components/EmptyWeekCard';
import { Footer } from '@/components/Footer';
import { WallpaperBackground } from '@/components/layout/WallpaperBackground';
import { AuthBanner } from '@/components/layout/AuthBanner';
import { TimetableModals } from '@/components/layout/TimetableModals';
import { useTheme } from '@/hooks/useTheme';
import { useWallpaper } from '@/hooks/useWallpaper';
import { useTimetable } from '@/hooks/useTimetable';

export default function TimetablePage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const {
    isWallpaperModalOpen,
    setIsWallpaperModalOpen,
    customBg,
    bgBlur,
    bgDim,
    handleSetCustomBg,
    handleSetBgBlur,
    handleSetBgDim,
  } = useWallpaper();

  const {
    baseMonday,
    filteredActivities,
    initialLoading,
    isNavigatingWeek,
    error,
    authBanner,
    setAuthBanner,
    isLive,
    user,
    viewMode,
    selectedCategory,
    showWeekend,
    slideDirection,
    transitionKey,
    selectedActivity,
    setSelectedActivity,
    isSettingsOpen,
    setIsSettingsOpen,
    isSearchOpen,
    setIsSearchOpen,
    checkAuth,
    fetchInitialTimetable,
    handlePrevWeek,
    handleNextWeek,
    handleToday,
    navigateToWeek,
    handleViewModeChange,
    handleLogout,
  } = useTimetable();

  return (
    <div
      className={`min-h-screen pt-safe-top md:pt-0 flex flex-col relative transition-colors duration-300 text-[#1d1d1f] dark:text-[#f5f5f7] ${
        customBg ? 'bg-transparent' : 'bg-[#fbfbfd] dark:bg-[#000000]'
      }`}
    >
      <WallpaperBackground
        customBg={customBg}
        bgBlur={bgBlur}
        bgDim={bgDim}
        darkMode={darkMode}
      />

      {/* Top Navbar for Desktop */}
      <div className="hidden md:block w-full sticky top-0 z-40">
        <Navbar
          isLive={isLive}
          user={user}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
          darkMode={darkMode}
          setDarkMode={toggleDarkMode}
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] md:pb-10 space-y-3 sm:space-y-4">
        {authBanner && (
          <AuthBanner
            banner={authBanner}
            onClose={() => setAuthBanner(null)}
          />
        )}

        {!isLive && !initialLoading ? (
          <UnauthHeroCard onConnect={() => setIsSettingsOpen(true)} />
        ) : (
          <>
            {error && (
              <div className="p-3.5 px-4 rounded-2xl apple-glass border border-[#ff3b30]/30 bg-[#ff3b30]/[0.06] text-[#ff3b30] text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
                <button
                  onClick={() => fetchInitialTimetable(baseMonday)}
                  className="flex items-center space-x-1 text-xs font-semibold underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Spróbuj ponownie</span>
                </button>
              </div>
            )}

            {initialLoading ? (
              <div className="py-28 flex flex-col items-center justify-center space-y-3">
                <div className="w-7 h-7 rounded-full border-2 border-[#fa243c] border-t-transparent animate-spin" />
                <p className="text-xs font-medium text-[#86868b]">
                  Ładowanie planu zajęć z USOS PRZ...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {viewMode === 'day' ? (
                  <TimetableDayView
                    activities={filteredActivities}
                    baseMonday={baseMonday}
                    showWeekend={showWeekend}
                    onSelectActivity={setSelectedActivity}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onToday={handleToday}
                    onNavigateToMonday={(targetMonday) => {
                      const dir = targetMonday.getTime() > baseMonday.getTime() ? 'right' : 'left';
                      navigateToWeek(targetMonday, dir);
                    }}
                    isNavigatingWeek={isNavigatingWeek}
                    slideDirection={slideDirection}
                    transitionKey={transitionKey}
                  />
                ) : (
                  <div
                    key={`${baseMonday.toISOString()}-${selectedCategory}-${viewMode}-${transitionKey}`}
                    className={
                      slideDirection === 'right'
                        ? 'anim-slide-right'
                        : slideDirection === 'left'
                          ? 'anim-slide-left'
                          : 'anim-filter-fade'
                    }
                  >
                    {filteredActivities.length === 0 ? (
                      <EmptyWeekCard
                        user={user}
                        onNextWeek={handleNextWeek}
                        onOpenSearch={() => setIsSearchOpen(true)}
                      />
                    ) : (
                      <>
                        {viewMode === 'week' && (
                          <TimetableWeekView
                            activities={filteredActivities}
                            baseMonday={baseMonday}
                            showWeekend={showWeekend}
                            onSelectActivity={setSelectedActivity}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                            onToday={handleToday}
                            isNavigatingWeek={isNavigatingWeek}
                          />
                        )}

                        {viewMode === 'list' && (
                          <TimetableListView
                            activities={filteredActivities}
                            onSelectActivity={setSelectedActivity}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <TimetableControls
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        isLive={isLive}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
      />

      <Footer />

      <TimetableModals
        selectedActivity={selectedActivity}
        onCloseActivity={() => setSelectedActivity(null)}
        isSettingsOpen={isSettingsOpen}
        onCloseSettings={() => setIsSettingsOpen(false)}
        isLive={isLive}
        user={user}
        onLogout={handleLogout}
        onRefreshAuth={() => {
          checkAuth();
          fetchInitialTimetable(baseMonday);
        }}
        isSearchOpen={isSearchOpen}
        onCloseSearch={() => setIsSearchOpen(false)}
        isWallpaperModalOpen={isWallpaperModalOpen}
        onCloseWallpaper={() => setIsWallpaperModalOpen(false)}
        customBg={customBg}
        onSetCustomBg={handleSetCustomBg}
        bgBlur={bgBlur}
        onSetBgBlur={handleSetBgBlur}
        bgDim={bgDim}
        onSetBgDim={handleSetBgDim}
        darkMode={darkMode}
        setDarkMode={toggleDarkMode}
      />
    </div>
  );
}
