'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { UpcomingBanner } from '@/components/UpcomingBanner';
import { TimetableControls } from '@/components/TimetableControls';
import { TimetableWeekView } from '@/components/TimetableWeekView';
import { TimetableDayView } from '@/components/TimetableDayView';
import { TimetableListView } from '@/components/TimetableListView';
import { ClassDetailModal } from '@/components/ClassDetailModal';
import { ApiSettingsModal } from '@/components/ApiSettingsModal';
import { CourseSearchModal } from '@/components/CourseSearchModal';
import { WallpaperModal } from '@/components/WallpaperModal';
import { LiveStatusBar } from '@/components/LiveStatusBar';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { useTheme } from '@/hooks/useTheme';
import { useWallpaper } from '@/hooks/useWallpaper';
import { useTimetable } from '@/hooks/useTimetable';
import { AlertCircle, RefreshCw, GraduationCap, ExternalLink, CheckCircle2, Calendar } from 'lucide-react';

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
    activities,
    filteredActivities,
    initialLoading,
    isNavigatingWeek,
    error,
    authBanner,
    setAuthBanner,
    isLive,
    isOfflineLoaded,
    lastSyncTime,
    user,
    viewMode,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    showWeekend,
    setShowWeekend,
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
    handleCategoryChange,
    handleViewModeChange,
    handleExportICal,
    handleLogout,
  } = useTimetable();

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 text-[#1d1d1f] dark:text-[#f5f5f7] ${customBg ? 'bg-transparent' : 'bg-[#fbfbfd] dark:bg-[#000000]'}`}>
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

      <Navbar
        isLive={isLive}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
        onExportICal={handleExportICal}
        darkMode={darkMode}
        setDarkMode={toggleDarkMode}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-3 sm:space-y-4">
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
              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{authBanner.message}</span>
            </div>
            <button
              onClick={() => setAuthBanner(null)}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#86868b]"
            >
              Zamknij
            </button>
          </div>
        )}

        {!isLive && !initialLoading ? (
          <div className="py-12 sm:py-20 max-w-xl mx-auto text-center space-y-6 animate-in fade-in duration-500">
            <div className="apple-card rounded-3xl p-8 sm:p-10 shadow-xl space-y-5 border border-black/[0.05] dark:border-white/[0.08] relative overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#fa243c] via-[#fb5c74] to-[#a855f7] text-white flex items-center justify-center shadow-lg shadow-[#fa243c]/25">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                  Plan Zajęć Politechniki Rzeszowskiej
                </h2>
                <p className="text-xs sm:text-sm text-[#86868b] mt-2 leading-relaxed max-w-md mx-auto">
                  Zaloguj się swoim kontem uczelnianym USOS PRZ, aby uzyskać bezpośredni dostęp do swojego oficjalnego planu zajęć, sal wykładowych i bieżących przedmiotów.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-7 py-3 cursor-pointer rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-[#fa243c]/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Połącz konto USOS PRZ
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => window.open('https://buycoffee.to/qrin-dev', '_blank')}
                  className="px-7 py-3 rounded-full hover:opacity-95 font-semibold text-xs border-1 cursor-pointer sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  ☕ Wesprzyj Twórcę
                </button>
              </div>

              <p className="text-[11px] text-[#86868b] pt-1">
                Bezpieczna autoryzacja OAuth 1.0a bezpośrednio przez serwery USOS PRZ
              </p>
            </div>
          </div>
        ) : (
          <>
            {activities.length > 0 && (
              <UpcomingBanner
                activities={activities}
                onSelectActivity={(act) => setSelectedActivity(act)}
              />
            )}

            <TimetableControls
              viewMode={viewMode}
              setViewMode={handleViewModeChange}
              baseMonday={baseMonday}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onToday={handleToday}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showWeekend={showWeekend}
              setShowWeekend={setShowWeekend}
              isNavigatingWeek={isNavigatingWeek}
            />

            {error && (
              <div className="p-3.5 px-4 rounded-2xl apple-glass border border-[#ff3b30]/30 bg-[#ff3b30]/[0.06] text-[#ff3b30] text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
                <button
                  onClick={() => fetchInitialTimetable(baseMonday)}
                  className="flex items-center space-x-1 text-xs font-semibold underline"
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
                <LiveStatusBar
                  activities={filteredActivities}
                  isOfflineLoaded={isOfflineLoaded}
                  lastSyncTime={lastSyncTime}
                />

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
                    <div className="apple-card rounded-3xl p-6 sm:p-12 text-center shadow-xs space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-[#fa243c]/10 text-[#fa243c] flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          Brak zajęć w wybranym tygodniu
                        </h3>
                        <p className="text-xs text-[#86868b] mt-1 max-w-md mx-auto">
                          Połączono z Twoim kontem USOS PRZ ({user?.first_name} {user?.last_name}). W tym tygodniu nie masz zaplanowanych zajęć.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          onClick={handleNextWeek}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white font-medium text-xs transition-all shadow-md shadow-[#fa243c]/20 active:scale-95"
                        >
                          Sprawdź następny tydzień
                        </button>
                        <button
                          onClick={() => setIsSearchOpen(true)}
                          className="px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-xs transition-all active:scale-95"
                        >
                          Katalog przedmiotów
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {viewMode === 'week' && (
                        <TimetableWeekView
                          activities={filteredActivities}
                          baseMonday={baseMonday}
                          showWeekend={showWeekend}
                          onSelectActivity={(act) => setSelectedActivity(act)}
                        />
                      )}

                      {viewMode === 'day' && (
                        <TimetableDayView
                          activities={filteredActivities}
                          baseMonday={baseMonday}
                          showWeekend={showWeekend}
                          onSelectActivity={(act) => setSelectedActivity(act)}
                        />
                      )}

                      {viewMode === 'list' && (
                        <TimetableListView
                          activities={filteredActivities}
                          onSelectActivity={(act) => setSelectedActivity(act)}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="relative z-10 mt-auto border-t border-black/[0.04] dark:border-white/[0.06] apple-glass py-5 sm:py-6 text-[11px] text-[#86868b] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              Politechnika Rzeszowska im. Ignacego Łukasiewicza
            </span>
            <span>•</span>
            <span>Zaprojektowane przez QrinDev</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://buycoffee.to/qrin-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0071e3] flex items-center space-x-1 transition-colors"
            >
              <span>Wesprzyj Twórcę</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

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
      />

      <PwaInstallPrompt />
    </div>
  );
}
