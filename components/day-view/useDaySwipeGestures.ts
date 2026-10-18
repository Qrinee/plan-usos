'use client';

import { useState, useRef } from 'react';
import { DayItem } from './types';

interface UseDaySwipeGesturesProps {
  currentWeekDays: DayItem[];
  selectedDateStr: string;
  setSelectedDateStr: (dateStr: string) => void;
  baseMonday: Date;
  showWeekend: boolean;
  onNavigateToMonday?: (monday: Date) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  setWeekSlideAnim: (anim: string) => void;
  setWeekAnimKey: React.Dispatch<React.SetStateAction<number>>;
}

export function useDaySwipeGestures({
  currentWeekDays,
  selectedDateStr,
  setSelectedDateStr,
  baseMonday,
  showWeekend,
  onNavigateToMonday,
  onPrevWeek,
  onNextWeek,
  setWeekSlideAnim,
  setWeekAnimKey,
}: UseDaySwipeGesturesProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hintRightRef = useRef<HTMLDivElement>(null);
  const hintLeftRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasHorizontalIntentRef = useRef<boolean | null>(null);

  const [daySlideAnim, setDaySlideAnim] = useState<string>('');

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToNextDay = () => {
    const curIdx = currentWeekDays.findIndex((d) => d.dateStr === selectedDateStr);
    if (curIdx >= 0 && curIdx < currentWeekDays.length - 1) {
      setDaySlideAnim('anim-day-slide-right');
      setSelectedDateStr(currentWeekDays[curIdx + 1].dateStr);
    } else {
      // Swiping left on Friday / last day -> Next week (Monday)!
      const nextMonday = new Date(baseMonday);
      nextMonday.setDate(baseMonday.getDate() + 7);
      const nextMondayStr = `${nextMonday.getFullYear()}-${(nextMonday.getMonth() + 1).toString().padStart(2, '0')}-${nextMonday.getDate().toString().padStart(2, '0')}`;
      setSelectedDateStr(nextMondayStr);
      setWeekSlideAnim('anim-week-slide-right');
      setWeekAnimKey((k) => k + 1);
      if (onNavigateToMonday) {
        onNavigateToMonday(nextMonday);
      } else if (onNextWeek) {
        onNextWeek();
      }
    }
  };

  const goToPrevDay = () => {
    const curIdx = currentWeekDays.findIndex((d) => d.dateStr === selectedDateStr);
    if (curIdx > 0) {
      setDaySlideAnim('anim-day-slide-left');
      setSelectedDateStr(currentWeekDays[curIdx - 1].dateStr);
    } else {
      // Swiping right on Monday -> Prev week (Friday)!
      const prevMonday = new Date(baseMonday);
      prevMonday.setDate(baseMonday.getDate() - 7);
      const lastDayOffset = showWeekend ? 6 : 4;
      const targetPrevDate = new Date(prevMonday);
      targetPrevDate.setDate(prevMonday.getDate() + lastDayOffset);
      const targetPrevDateStr = `${targetPrevDate.getFullYear()}-${(targetPrevDate.getMonth() + 1).toString().padStart(2, '0')}-${targetPrevDate.getDate().toString().padStart(2, '0')}`;
      setSelectedDateStr(targetPrevDateStr);
      setWeekSlideAnim('anim-week-slide-left');
      setWeekAnimKey((k) => k + 1);
      if (onNavigateToMonday) {
        onNavigateToMonday(prevMonday);
      } else if (onPrevWeek) {
        onPrevWeek();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    hasHorizontalIntentRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    if (hasHorizontalIntentRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        hasHorizontalIntentRef.current = Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
      }
    }

    if (!hasHorizontalIntentRef.current) return;

    // Dampen drag translation for smooth tactile response
    const damp = 0.35;
    const translateX = Math.max(-85, Math.min(85, deltaX * damp));
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;
      cardRef.current.style.transition = 'none';
    }

    // Show edge preview hint
    if (deltaX < -20) {
      const progress = Math.min(1, (Math.abs(deltaX) - 20) / 40);
      if (hintRightRef.current) {
        hintRightRef.current.style.opacity = progress.toString();
        hintRightRef.current.style.transform = `translate3d(0, -50%, 0) scale(${0.85 + progress * 0.15})`;
      }
      if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';
    } else if (deltaX > 20) {
      const progress = Math.min(1, (deltaX - 20) / 40);
      if (hintLeftRef.current) {
        hintLeftRef.current.style.opacity = progress.toString();
        hintLeftRef.current.style.transform = `translate3d(0, -50%, 0) scale(${0.85 + progress * 0.15})`;
      }
      if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
    } else {
      if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
      if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || touchStartX.current === null) return;
    isDraggingRef.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const wasHorizontal = hasHorizontalIntentRef.current;
    touchStartX.current = null;
    touchStartY.current = null;
    hasHorizontalIntentRef.current = null;

    if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
    if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';

    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)';
      cardRef.current.style.transform = 'translate3d(0, 0, 0)';
    }

    if (wasHorizontal && Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        goToNextDay();
      } else {
        goToPrevDay();
      }
    }
  };

  const handleTouchCancel = () => {
    isDraggingRef.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    hasHorizontalIntentRef.current = null;
    if (hintRightRef.current) hintRightRef.current.style.opacity = '0';
    if (hintLeftRef.current) hintLeftRef.current.style.opacity = '0';
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)';
      cardRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

  return {
    cardRef,
    hintRightRef,
    hintLeftRef,
    daySlideAnim,
    setDaySlideAnim,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  };
}
