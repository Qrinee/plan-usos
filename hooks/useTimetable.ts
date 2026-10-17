'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { USOSActivity, USOSUser } from '@/lib/usos/types';
import { generateICalendar } from '@/lib/usos/ical';
import { getMonday, getInitialMonday, parseDate } from '@/lib/utils/date';
import { ViewMode } from '@/components/TimetableControls';

function getIsMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const isMobileUA = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent);
  const isNarrow = window.innerWidth < 768;
  return isMobileUA || isNarrow;
}

export function useTimetable() {
  const [baseMonday, setBaseMonday] = useState<Date>(() => getInitialMonday());
  const [activities, setActivities] = useState<USOSActivity[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isNavigatingWeek, setIsNavigatingWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authBanner, setAuthBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const weekCacheRef = useRef<Map<string, USOSActivity[]>>(new Map());
  const lastIsMobileRef = useRef<boolean | null>(null);

  const [isLive, setIsLive] = useState(false);
  const [user, setUser] = useState<USOSUser | null>(null);
  const [isOfflineLoaded, setIsOfflineLoaded] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWeekend, setShowWeekend] = useState<boolean>(false);

  const [slideDirection, setSlideDirection] = useState<'right' | 'left' | 'fade'>('fade');
  const [transitionKey, setTransitionKey] = useState<number>(0);

  const [selectedActivity, setSelectedActivity] = useState<USOSActivity | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    try {
      const savedSync = localStorage.getItem('usos_last_sync_time');
      if (savedSync) setLastSyncTime(savedSync);

      const cachedUser = localStorage.getItem('usos_cached_user');
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        if (parsed) setUser(parsed);
      }
    } catch { }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        const authed = data.authenticated && data.mode === 'live';
        setIsLive(authed);
        setUser(data.user || null);
        if (data.user) {
          try {
            localStorage.setItem('usos_cached_user', JSON.stringify(data.user));
          } catch { }
        }
        return authed;
      }
    } catch (err) {
      console.warn('Failed checking auth status, falling back to cached user:', err);
      try {
        const cachedUser = localStorage.getItem('usos_cached_user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setIsLive(true);
        }
      } catch { }
    }
    return false;
  }, []);

  const initialFetchDoneRef = useRef(false);

  const prefetchWeek = useCallback(async (monday: Date) => {
    const startStr = `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')}`;
    if (weekCacheRef.current.has(startStr)) return;

    try {
      if (typeof window !== 'undefined') {
        const cachedRaw = localStorage.getItem(`usos_offline_timetable_${startStr}`);
        if (cachedRaw) {
          try {
            const cachedActs = JSON.parse(cachedRaw);
            weekCacheRef.current.set(startStr, cachedActs);
            return;
          } catch { }
        }
      }

      const res = await fetch(`/api/usos/timetable?start=${startStr}&days=7`);
      if (res.ok) {
        const data = await res.json();
        if (!data.error && data.isLive) {
          const acts = data.activities || [];
          if (acts.length > 0) {
            weekCacheRef.current.set(startStr, acts);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(`usos_offline_timetable_${startStr}`, JSON.stringify(acts));
              } catch { }
            }
          }
        }
      }
    } catch {
      // Silent catch on background prefetch
    }
  }, []);

  const fetchInitialTimetable = useCallback(async (monday: Date) => {
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
            try {
              if (acts.length > 0) {
                localStorage.setItem(`usos_offline_timetable_${startStr}`, JSON.stringify(acts));
              }
            } catch { }
            navigateToWeek(nextMonday, 'fade');
            return;
          }
        }
      }

      setActivities(acts);
      setIsLive(data.isLive || false);
      setIsOfflineLoaded(false);

      try {
        if (acts.length > 0) {
          localStorage.setItem(`usos_offline_timetable_${startStr}`, JSON.stringify(acts));
          const nowIso = new Date().toISOString();
          localStorage.setItem('usos_last_sync_time', nowIso);
          setLastSyncTime(nowIso);
        }
      } catch (storageErr) {
        console.warn('Could not cache timetable in localStorage:', storageErr);
      }

      const prevM = new Date(monday);
      prevM.setDate(monday.getDate() - 7);
      const nextM = new Date(monday);
      nextM.setDate(monday.getDate() + 7);
      prefetchWeek(prevM);
      prefetchWeek(nextM);
    } catch (err: any) {
      console.warn('Error fetching timetable, attempting offline cache:', err);

      try {
        const cachedRaw = localStorage.getItem(`usos_offline_timetable_${startStr}`);
        if (cachedRaw) {
          const cachedActs = JSON.parse(cachedRaw);
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
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('usos_offline_timetable_')) {
            const fallbackRaw = localStorage.getItem(key);
            if (fallbackRaw) {
              const fallbackActs = JSON.parse(fallbackRaw);
              setActivities(fallbackActs);
              setIsOfflineLoaded(true);
              setIsLive(true);
              setError(null);
              return;
            }
          }
        }
      } catch (cacheErr) {
        console.error('Failed reading offline cache:', cacheErr);
      }

      setError(err.message || 'Brak połączenia z siecią. Włącz internet, aby pobrać plan.');
    } finally {
      setInitialLoading(false);
    }
  }, [prefetchWeek]);

  const navigateToWeek = useCallback(async (targetMonday: Date, direction: 'right' | 'left' | 'fade') => {
    const startStr = `${targetMonday.getFullYear()}-${(targetMonday.getMonth() + 1).toString().padStart(2, '0')}-${targetMonday.getDate().toString().padStart(2, '0')}`;

    const cached = weekCacheRef.current.get(startStr);
    if (cached && cached.length > 0) {
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

      try {
        if (newActs.length > 0) {
          localStorage.setItem(`usos_offline_timetable_${startStr}`, JSON.stringify(newActs));
          const nowIso = new Date().toISOString();
          localStorage.setItem('usos_last_sync_time', nowIso);
          setLastSyncTime(nowIso);
        }
      } catch { }

      const prevM = new Date(targetMonday);
      prevM.setDate(targetMonday.getDate() - 7);
      const nextM = new Date(targetMonday);
      nextM.setDate(targetMonday.getDate() + 7);
      prefetchWeek(prevM);
      prefetchWeek(nextM);
    } catch (err: any) {
      console.warn('Failed to navigate week via network, checking offline storage:', err);
      try {
        const cachedRaw = localStorage.getItem(`usos_offline_timetable_${startStr}`);
        if (cachedRaw) {
          const cachedActs = JSON.parse(cachedRaw);
          weekCacheRef.current.set(startStr, cachedActs);
          setSlideDirection(direction);
          setTransitionKey((prev) => prev + 1);
          setBaseMonday(targetMonday);
          setActivities(cachedActs);
          setIsOfflineLoaded(true);
          return;
        }
      } catch { }

      setError(err.message || 'Nie udało się pobrać wybranego tygodnia');
    } finally {
      setIsNavigatingWeek(false);
    }
  }, [prefetchWeek]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get('auth');
      const authError = params.get('auth_error');

      if (auth === 'success') {
        setAuthBanner({
          type: 'success',
          message: 'Pomyślnie połączono z USOS Politechniki Rzeszowskiej!',
        });
        window.history.replaceState({}, '', '/');
        checkAuth().then(() => fetchInitialTimetable(baseMonday));
      } else if (authError) {
        setAuthBanner({
          type: 'error',
          message: `Błąd autoryzacji USOS: ${decodeURIComponent(authError).replace(/_/g, ' ')}`,
        });
        window.history.replaceState({}, '', '/');
      }
    }
  }, [baseMonday, checkAuth, fetchInitialTimetable]);

  useEffect(() => {
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;

    checkAuth();
    fetchInitialTimetable(baseMonday);

    try {
      const isMobile = getIsMobileDevice();
      lastIsMobileRef.current = isMobile;
      const storageKey = isMobile ? 'usos_preferred_view_mobile' : 'usos_preferred_view_desktop';
      const defaultMode: ViewMode = isMobile ? 'day' : 'week';

      // Usuń stary, wspólny klucz jeśli istnieje, by telefon nie odziedziczył 'week'
      localStorage.removeItem('usos_preferred_view');

      const savedView = localStorage.getItem(storageKey) as ViewMode | null;
      if (savedView && (savedView === 'week' || savedView === 'day' || savedView === 'list')) {
        setViewMode(savedView);
      } else {
        setViewMode(defaultMode);
      }
    } catch { }
  }, [checkAuth, fetchInitialTimetable, baseMonday]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = getIsMobileDevice();
      if (lastIsMobileRef.current !== null && isMobile !== lastIsMobileRef.current) {
        lastIsMobileRef.current = isMobile;
        const storageKey = isMobile ? 'usos_preferred_view_mobile' : 'usos_preferred_view_desktop';
        const saved = localStorage.getItem(storageKey) as ViewMode | null;
        if (saved && (saved === 'week' || saved === 'day' || saved === 'list')) {
          setViewMode(saved);
        } else {
          setViewMode(isMobile ? 'day' : 'week');
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleCategoryChange = (cat: string) => {
    setSlideDirection('fade');
    setTransitionKey((prev) => prev + 1);
    setSelectedCategory(cat);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setSlideDirection('fade');
    setTransitionKey((prev) => prev + 1);
    setViewMode(mode);
    try {
      const isMobile = getIsMobileDevice();
      const storageKey = isMobile ? 'usos_preferred_view_mobile' : 'usos_preferred_view_desktop';
      localStorage.setItem(storageKey, mode);
    } catch { }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (selectedCategory !== 'all') {
        const cat = act.category || '';
        const classtypeStr = (
          typeof act.classtype_name === 'object'
            ? act.classtype_name?.pl || ''
            : act.classtype_name || ''
        ).toLowerCase();

        if (cat !== selectedCategory && !classtypeStr.includes(selectedCategory)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (typeof act.name === 'object' ? act.name?.pl || '' : act.name || '').toLowerCase();
        const courseId = (act.course_id || '').toLowerCase();
        const room = (act.room_number || '').toLowerCase();
        const lecturers = (act.lecturer_names || []).join(' ').toLowerCase();
        const note = (act.note || '').toLowerCase();

        if (
          !name.includes(q) &&
          !courseId.includes(q) &&
          !room.includes(q) &&
          !lecturers.includes(q) &&
          !note.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activities, selectedCategory, searchQuery]);

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
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLive(false);
    setUser(null);
    checkAuth();
    fetchInitialTimetable(baseMonday);
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
