'use client';

import { useEffect } from 'react';

interface UseWeekKeyboardNavProps {
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
}

export function useWeekKeyboardNav({
  onPrevWeek,
  onNextWeek,
  onToday,
}: UseWeekKeyboardNavProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevWeek?.();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNextWeek?.();
      } else if (e.key === 't' || e.key === 'T' || e.key === 'Home') {
        e.preventDefault();
        onToday?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevWeek, onNextWeek, onToday]);
}
