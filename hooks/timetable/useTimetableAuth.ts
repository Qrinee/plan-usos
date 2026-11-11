'use client';

import { useState, useEffect, useCallback } from 'react';
import { USOSUser } from '@/lib/usos/types';
import { getCachedUser, saveCachedUser } from '@/lib/timetable/timetableStorage';

export function useTimetableAuth(onAuthSuccess?: () => void) {
  const [isLive, setIsLive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!getCachedUser();
  });
  const [user, setUser] = useState<USOSUser | null>(() => {
    if (typeof window === 'undefined') return null;
    return getCachedUser();
  });
  const [authBanner, setAuthBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
      setIsLive(true);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        const authed = data.authenticated && data.mode === 'live';
        setIsLive(authed);
        if (data.user) {
          setUser(data.user);
          saveCachedUser(data.user);
        } else {
          const cached = getCachedUser();
          if (cached) {
            setUser(cached);
          } else {
            setUser(null);
          }
        }
        return authed;
      }
    } catch (err) {
      console.warn('Failed checking auth status, falling back to cached user:', err);
      const cached = getCachedUser();
      if (cached) {
        setUser(cached);
        setIsLive(true);
      }
    }
    return false;
  }, []);

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
        checkAuth().then(() => {
          onAuthSuccess?.();
        });
      } else if (authError) {
        setAuthBanner({
          type: 'error',
          message: `Błąd autoryzacji USOS: ${decodeURIComponent(authError).replace(/_/g, ' ')}`,
        });
        window.history.replaceState({}, '', '/');
      }
    }
  }, [checkAuth, onAuthSuccess]);

  const handleLogout = useCallback(
    async (afterLogout?: () => void) => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {
        console.warn('Logout request failed:', e);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('usos_cached_user');
      }
      setIsLive(false);
      setUser(null);
      afterLogout?.();
    },
    []
  );

  return {
    isLive,
    setIsLive,
    user,
    setUser,
    authBanner,
    setAuthBanner,
    checkAuth,
    handleLogout,
  };
}
