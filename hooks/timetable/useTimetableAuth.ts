'use client';

import { useState, useEffect, useCallback } from 'react';
import { USOSUser } from '@/lib/usos/types';
import { getCachedUser, saveCachedUser } from '@/lib/timetable/timetableStorage';

export function useTimetableAuth(onAuthSuccess?: () => void) {
  const [isLive, setIsLive] = useState(false);
  const [user, setUser] = useState<USOSUser | null>(null);
  const [authBanner, setAuthBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) setUser(cached);
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
          saveCachedUser(data.user);
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
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLive(false);
      setUser(null);
      checkAuth();
      afterLogout?.();
    },
    [checkAuth]
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
