'use client';

import { useRef, useCallback, useEffect, useLayoutEffect } from 'react';

interface UseRibbonScrollProps {
  baseMonday: Date;
  isNavigatingWeek: boolean;
  onNavigateToMonday?: (monday: Date) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export function useRibbonScroll({
  baseMonday,
  isNavigatingWeek,
  onNavigateToMonday,
  onPrevWeek,
  onNextWeek,
}: UseRibbonScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Auto-center ribbon so the current week (offset 0) is displayed
  const centerActiveWeek = useCallback((smooth = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetLeft = container.clientWidth;
    if (targetLeft <= 0) {
      requestAnimationFrame(() => {
        if (container && container.clientWidth > 0) {
          container.scrollLeft = container.clientWidth;
        }
      });
      return;
    }

    isProgrammaticScrollRef.current = true;
    if (!smooth) {
      container.style.scrollSnapType = 'none';
      container.scrollLeft = targetLeft;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (container) {
            container.style.scrollSnapType = 'x mandatory';
          }
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
            isNavigatingRef.current = false;
          }, 50);
        });
      });
    } else {
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        isNavigatingRef.current = false;
      }, 350);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    centerActiveWeek(false);
  }, [baseMonday, centerActiveWeek]);

  useEffect(() => {
    const handleResize = () => centerActiveWeek(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerActiveWeek]);

  // Magnetic snap week transition when ribbon is scrolled to left or right
  const handleWeekScroll = () => {
    if (isProgrammaticScrollRef.current || isNavigatingRef.current || isNavigatingWeek) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    if (width <= 0) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (isProgrammaticScrollRef.current || isNavigatingRef.current || isNavigatingWeek) return;

      const scrollLeft = container.scrollLeft;
      const pageIndex = Math.round(scrollLeft / width);

      if (pageIndex === 0) {
        isNavigatingRef.current = true;
        const prevMonday = new Date(baseMonday);
        prevMonday.setDate(baseMonday.getDate() - 7);

        if (onNavigateToMonday) {
          onNavigateToMonday(prevMonday);
        } else if (onPrevWeek) {
          onPrevWeek();
        }

        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 800);
      } else if (pageIndex === 2) {
        isNavigatingRef.current = true;
        const nextMonday = new Date(baseMonday);
        nextMonday.setDate(baseMonday.getDate() + 7);

        if (onNavigateToMonday) {
          onNavigateToMonday(nextMonday);
        } else if (onNextWeek) {
          onNextWeek();
        }

        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 800);
      }
    }, 60);
  };

  // Mouse drag-to-scroll support for desktop
  const isMouseDownRef = useRef(false);
  const startMouseXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startMouseXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const deltaX = e.clientX - startMouseXRef.current;
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
      container.style.scrollSnapType = 'none';
      container.scrollLeft = startScrollLeftRef.current - deltaX;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const container = scrollContainerRef.current;
    if (!container) return;

    if (hasDraggedRef.current) {
      container.style.scrollSnapType = 'x mandatory';
      const width = container.clientWidth;
      const pageIndex = Math.round(container.scrollLeft / width);
      container.scrollTo({ left: pageIndex * width, behavior: 'smooth' });
    }
  };

  return {
    scrollContainerRef,
    hasDraggedRef,
    handleWeekScroll,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  };
}
