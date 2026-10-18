'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode } from '@/components/TimetableControls';

export function getIsMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const isMobileUA = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent);
  const isNarrow = window.innerWidth < 768;
  return isMobileUA || isNarrow;
}

export function useViewPreferences(onTransition?: () => void) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const lastIsMobileRef = useRef<boolean | null>(null);

  useEffect(() => {
    try {
      const isMobile = getIsMobileDevice();
      lastIsMobileRef.current = isMobile;
      const storageKey = isMobile ? 'usos_preferred_view_mobile' : 'usos_preferred_view_desktop';
      const defaultMode: ViewMode = isMobile ? 'day' : 'week';

      // Remove legacy shared key if it exists
      localStorage.removeItem('usos_preferred_view');

      const savedView = localStorage.getItem(storageKey) as ViewMode | null;
      if (savedView && (savedView === 'week' || savedView === 'day' || savedView === 'list')) {
        setViewMode(savedView);
      } else {
        setViewMode(defaultMode);
      }
    } catch {}
  }, []);

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

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      onTransition?.();
      setViewMode(mode);
      try {
        const isMobile = getIsMobileDevice();
        const storageKey = isMobile ? 'usos_preferred_view_mobile' : 'usos_preferred_view_desktop';
        localStorage.setItem(storageKey, mode);
      } catch {}
    },
    [onTransition]
  );

  return {
    viewMode,
    setViewMode,
    handleViewModeChange,
  };
}
