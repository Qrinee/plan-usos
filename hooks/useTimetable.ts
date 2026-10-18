'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { generateICalendar } from '@/lib/usos/ical';
import { getMonday, getInitialMonday, parseDate } from '@/lib/utils/date';
import {
  cleanLegacyTimetableCaches,
  getSavedSyncTime,
  saveSyncTime,
  getCachedWeekActivities,
  saveCachedWeekActivities,
  getAnyFallbackActivities,
} from '@/lib/timetable/timetableStorage';
import { useViewPreferences } from './timetable/useViewPreferences';
import { useTimetableAuth } from './timetable/useTimetableAuth';
import { useTimetableFilter } from './timetable/useTimetableFilter';

export function useTimetable() {
  const [baseMonday, setBaseMonday] = useState<Date>(() => getInitialMonday());
  const [activities, setActivities] = useState<USOSActivity[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isNavigatingWeek, setIsNavigatingWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekCacheRef = useRef<Map<string, USOSActivity[]>>(new Map());
  const initialFetchDoneRef = useRef(false);

  const [isOfflineLoaded, setIsOfflineLoaded] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [showWeekend, setShowWeekend] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left' | 'fade'>('fade');
  const [transitionKey, setTransitionKey] = useState<number>(0);

  const [selectedActivity, setSelectedActivity] = useState<USOSActivity | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const triggerTransition = useCallback(() => {
    setSlideDirection('fade');
    setTransitionKey((prev) => prev + 1);
  }, []);

  const { viewMode, setViewMode, handleViewModeChange } = useViewPreferences(triggerTransition);

  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredActivities,
    handleCategoryChange,
  } = useTimetableFilter(activities, triggerTransition);

  useEffect(() => {
    cleanLegacyTimetableCaches();
    const savedSync = getSavedSyncTime();
    if (savedSync) setLastSyncTime(savedSync);
  }, []);

  const prefetchWeek = useCallback(async (monday: Date) => {
    const startStr = `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')}`;
    if (weekCacheRef.current.has(startStr)) return;

    try {
      const cached = getCachedWeekActivities(startStr, true);
      if (cached) {
        weekCacheRef.current.set(startStr, cached);
        return;
      }

      const res = await fetch(`/api/usos/timetable?start=${startStr}&days=7`);
      if (res.ok) {
        const data = await res.json();
        if (!data.error && data.isLive) {
          const acts = data.activities || [];
          if (acts.length > 0) {
            weekCacheRef.current.set(startStr, acts);
            saveCachedWeekActivities(startStr, acts);
          }
        }
      }
    } catch {
      // Silent catch on background prefetch
    }
  }, []);

  const navigateToWeek = useCallback(
    async (targetMonday: Date, direction: 'right' | 'left' | 'fade') => {
      const startStr = `${targetMonday.getFullYear()}-${(targetMonday.getMonth() + 1).toString().padStart(2, '0')}-${targetMonday.getDate().toString().padStart(2, '0')}`;

      const cached = weekCacheRef.current.get(startStr);
      const hasLecturers =
        cached &&
        cached.some((a: any) => (a.lecturer_names && a.lecturer_names.length > 0) || (a.lecturers && a.lecturers.length > 0));

      if (cached && cached.length > 0 && hasLecturers) {
        setSlideDirection(direction);
        setTransitionKey((prev) => prev + 1);
        setBaseMonday(targetMonday);
        setActivities(cached);

        const prevM = new Date(targetMonday);
        prevM.setDate(targetMonday.getDate() - 7);
        const nextM = new Date(targetMonday);
        nextM.setDate(targetMonday.getDate() + 7);
        prefetchWeek(prevM);
        prefetchWeek(nextM);
        return;
      }

      setIsNavigatingWeek(true);
      try {
        const res = await fetch(`/api/usos/timetable?start=${startStr}&days=7`);
        if (!res.ok) throw new Error(`Błąd pobierania (${res.status})`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        }
        const newActs = data.activities || [];
        if (data.isLive !== false && !data.error) {
          weekCacheRef.current.set(startStr, newActs);
        }

        setSlideDirection(direction);
        setTransitionKey((prev) => prev + 1);
        setBaseMonday(targetMonday);
        setActivities(newActs);
        if (data.isLive !== undefined) setIsLive(data.isLive);
        setIsOfflineLoaded(false);

        if (newActs.length > 0) {
          saveCachedWeekActivities(startStr, newActs);
          const nowIso = new Date().toISOString();
          saveSyncTime(nowIso);
          setLastSyncTime(nowIso);
        }

        const prevM = new Date(targetMonday);
        prevM.setDate(targetMonday.getDate() - 7);
        const nextM = new Date(targetMonday);
        nextM.setDate(targetMonday.getDate() + 7);
        prefetchWeek(prevM);
        prefetchWeek(nextM);
      } catch (err: any) {
        console.warn('Failed to navigate week via network, checking offline storage:', err);
        const cachedRawActs = getCachedWeekActivities(startStr, false);
        if (cachedRawActs) {
          weekCacheRef.current.set(startStr, cachedRawActs);
          setSlideDirection(direction);
          setTransitionKey((prev) => prev + 1);
          setBaseMonday(targetMonday);
          setActivities(cachedRawActs);
          setIsOfflineLoaded(true);
          return;
        }

        setError(err.message || 'Nie udało się pobrać wybranego tygodnia');
      } finally {
        setIsNavigatingWeek(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefetchWeek]
  );

  const fetchInitialTimetable = useCallback(
    async (monday: Date) => {
      setInitialLoading(true);
      setError(null);
      const startStr = `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')}`;

      try {
        const res = await fetch(`/api/usos/timetable?start=${startStr}&days=7`);
        if (!res.ok) {
          throw new Error(`Błąd pobierania planu lekcji (${res.status})`);
        }
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        }
        const acts = data.activities || [];
        weekCacheRef.current.set(startStr, acts);

        const now = new Date();
        const day = now.getDay();
        if ((day === 5 || day === 6 || day === 0) && acts.length > 0) {
          const nowMs = now.getTime();
          const hasUpcoming = acts.some((act: USOSActivity) => parseDate(act.end_time).getTime() > nowMs);
          if (!hasUpcoming) {
            const nextMonday = new Date(monday);
            nextMonday.setDate(monday.getDate() + 7);
            const nextStartStr = `${nextMonday.getFullYear()}-${(nextMonday.getMonth() + 1).toString().padStart(2, '0')}-${nextMonday.getDate().toString().padStart(2, '0')}`;
            if (startStr !== nextStartStr) {
              if (acts.length > 0) {
                saveCachedWeekActivities(startStr, acts);
              }
              navigateToWeek(nextMonday, 'fade');
              return;
            }
          }
        }

        setActivities(acts);
        setIsLive(data.isLive || false);
        setIsOfflineLoaded(false);

        if (acts.length > 0) {
          saveCachedWeekActivities(startStr, acts);
          const nowIso = new Date().toISOString();
          saveSyncTime(nowIso);
          setLastSyncTime(nowIso);
        }

        const prevM = new Date(monday);
        prevM.setDate(monday.getDate() - 7);
        const nextM = new Date(monday);
        nextM.setDate(monday.getDate() + 7);
        prefetchWeek(prevM);
        prefetchWeek(nextM);
      } catch (err: any) {
        console.warn('Error fetching timetable, attempting offline cache:', err);

        const cachedActs = getCachedWeekActivities(startStr, false);
        if (cachedActs) {
          weekCacheRef.current.set(startStr, cachedActs);

          const now = new Date();
          const day = now.getDay();
          if ((day === 5 || day === 6 || day === 0) && cachedActs.length > 0) {
            const nowMs = now.getTime();
            const hasUpcoming = cachedActs.some((act: any) => parseDate(act.end_time).getTime() > nowMs);
            if (!hasUpcoming) {
              const nextMonday = new Date(monday);
              nextMonday.setDate(monday.getDate() + 7);
              const nextStartStr = `${nextMonday.getFullYear()}-${(nextMonday.getMonth() + 1).toString().padStart(2, '0')}-${nextMonday.getDate().toString().padStart(2, '0')}`;
              if (startStr !== nextStartStr) {
                navigateToWeek(nextMonday, 'fade');
                return;
              }
            }
          }

          setActivities(cachedActs);
          setIsOfflineLoaded(true);
          setIsLive(true);
          setError(null);
          return;
        }

        const fallbackActs = getAnyFallbackActivities();
        if (fallbackActs) {
          setActivities(fallbackActs);
          setIsOfflineLoaded(true);
          setIsLive(true);
          setError(null);
          return;
        }

        setError(err.message || 'Brak połączenia z siecią. Włącz internet, aby pobrać plan.');
      } finally {
        setInitialLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigateToWeek, prefetchWeek]
  );

  const { isLive, setIsLive, user, authBanner, setAuthBanner, checkAuth, handleLogout: authLogout } =
    useTimetableAuth(() => {
      fetchInitialTimetable(baseMonday);
    });

  useEffect(() => {
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;

    checkAuth();
    fetchInitialTimetable(baseMonday);
  }, [checkAuth, fetchInitialTimetable, baseMonday]);

  const handlePrevWeek = () => {
    const next = new Date(baseMonday);
    next.setDate(baseMonday.getDate() - 7);
    navigateToWeek(next, 'left');
  };

  const handleNextWeek = () => {
    const next = new Date(baseMonday);
    next.setDate(baseMonday.getDate() + 7);
    navigateToWeek(next, 'right');
  };

  const handleToday = () => {
    navigateToWeek(getMonday(new Date()), 'fade');
  };

  const handleExportICal = () => {
    if (!activities || activities.length === 0) return;
    const icsContent = generateICalendar(activities, 'Plan Lekcji Politechnika Rzeszowska USOS');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Plan_PRZ_USOS_${baseMonday.toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await authLogout(() => {
      fetchInitialTimetable(baseMonday);
    });
  };

  return {
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
    navigateToWeek,
    handleCategoryChange,
    handleViewModeChange,
    handleExportICal,
    handleLogout,
  };
}
