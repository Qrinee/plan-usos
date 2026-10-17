'use client';

import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { TimetableControls } from '@/components/TimetableControls';
import { TimetableWeekView } from '@/components/TimetableWeekView';
import { TimetableDayView } from '@/components/TimetableDayView';
import { TimetableListView } from '@/components/TimetableListView';
import { ClassDetailModal } from '@/components/ClassDetailModal';
import { ApiSettingsModal } from '@/components/ApiSettingsModal';
import { CourseSearchModal } from '@/components/CourseSearchModal';
import { WallpaperModal } from '@/components/WallpaperModal';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { UnauthHeroCard } from '@/components/UnauthHeroCard';
import { EmptyWeekCard } from '@/components/EmptyWeekCard';
import { Footer } from '@/components/Footer';
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
      className={`min-h-screen pt-safe-top md:pt-0 flex flex-col relative transition-colors duration-300 text-[#1d1d1f] dark:text-[#f5f5f7] ${customBg ? 'bg-transparent' : 'bg-[#fbfbfd] dark:bg-[#000000]'
        }`}
    >
      {/* Background Layer: Custom Image Wallpaper or Dynamic Aura */}
      {customBg ? (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -inset-6 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
            style={{
              backgroundImage: `url(${customBg})`,
              filter: `blur(${bgBlur}px)`,
              transform: 'scale(1.06)',
            }}
          />
          <div
            className="absolute inset-0 transition-colors duration-500"
            style={{
              backgroundColor: darkMode
                ? `rgba(0, 0, 0, ${bgDim / 100})`
                : `rgba(255, 255, 255, ${Math.min(0.65, (bgDim / 100) * 0.7)})`,
            }}
          />
        </div>
      ) : (
        <div className="apple-music-aura">
          <div className="apple-music-aura-1" />
          <div className="apple-music-aura-2" />
        </div>
      )}

      {/* Top Navbar for Desktop (Computer) */}
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
        {/* Auth Notification Banner */}
        {authBanner && (
          <div
            className={`p-3.5 px-4 rounded-2xl apple-glass border text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-300 ${authBanner.type === 'success'
              ? 'border-[#34c759]/30 text-[#34c759] bg-[#34c759]/[0.08]'
              : 'border-[#ff3b30]/30 text-[#ff3b30] bg-[#ff3b30]/[0.08]'
              }`}
          >
            <div className="flex items-center space-x-2">
              {authBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#ff3b30] shrink-0" />
              )}
              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                {authBanner.message}
              </span>
            </div>
            <button
              onClick={() => setAuthBanner(null)}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#86868b] cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        )}

        {/* Landing Hero when unauthenticated */}
        {!isLive && !initialLoading ? (
          <UnauthHeroCard onConnect={() => setIsSettingsOpen(true)} />
        ) : (
          <>
            {/* Error Notification */}
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

            {/* Initial Loading Spinner */}
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

      {/* Sticky Mobile Floating Controls Dock */}
      <TimetableControls
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        isLive={isLive}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
      />

      {/* Footer */}
      <Footer />

      {/* Modals and Overlays */}
      <ClassDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isLive={isLive}
        user={user}
        onLogout={handleLogout}
        onRefresh={() => {
          checkAuth();
          fetchInitialTimetable(baseMonday);
        }}
      />

      <CourseSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        customBg={customBg}
        onSetCustomBg={handleSetCustomBg}
        bgBlur={bgBlur}
        onSetBgBlur={handleSetBgBlur}
        bgDim={bgDim}
        onSetBgDim={handleSetBgDim}
        darkMode={darkMode}
        setDarkMode={toggleDarkMode}
      />

      <PwaInstallPrompt />
    </div>
  );
}
