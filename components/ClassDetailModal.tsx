'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { generateICalendar } from '@/lib/usos/ical';
import { useBottomSheetDrag } from '@/hooks/useBottomSheetDrag';
import { ClassDetailHeader } from './class-detail/ClassDetailHeader';
import { ClassDetailLocation } from './class-detail/ClassDetailLocation';
import { ClassDetailLecturers } from './class-detail/ClassDetailLecturers';
import { ClassDetailFooter } from './class-detail/ClassDetailFooter';

interface ClassDetailModalProps {
  activity: USOSActivity | null;
  onClose: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  activity: externalActivity,
  onClose,
}) => {
  const [renderedActivity, setRenderedActivity] = useState<USOSActivity | null>(externalActivity);
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  const {
    isClosing,
    dragY,
    isDragging,
    handleClose,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetDrag,
  } = useBottomSheetDrag({ onClose });

  useEffect(() => {
    if (externalActivity) {
      setRenderedActivity(externalActivity);
      resetDrag();
    } else {
      setRenderedActivity(null);
      resetDrag();
    }
  }, [externalActivity, resetDrag]);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isApple =
        /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsAppleDevice(isApple);
    }
  }, []);

  if (!renderedActivity) return null;
  const activity = renderedActivity;

  const name = typeof activity.name === 'string' ? activity.name : activity.name?.pl || 'Zajęcia';

  const handleDownloadSingleICal = () => {
    const icsContent = generateICalendar([activity], name);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const usoswebUrl =
    activity.url ||
    (activity.course_id
      ? `https://usosweb.prz.edu.pl/kontroler.php?_action=katalog2/przedmioty/pokazPrzedmiot&prz_kod=${encodeURIComponent(
          activity.course_id
        )}`
      : 'https://usosweb.prz.edu.pl/');

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md ${
        isClosing ? 'anim-backdrop-fade-out' : 'anim-backdrop-fade'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-lg apple-card rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] ${
          isClosing ? 'anim-sheet-slide-down' : 'anim-sheet-slide-up'
        }`}
        style={
          isDragging
            ? { transform: `translate3d(0, ${Math.max(0, dragY)}px, 0)`, transition: 'none' }
            : dragY > 0 && isClosing
              ? { transform: 'translate3d(0, 100%, 0)', transition: 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)' }
              : dragY > 0 && !isClosing
                ? { transform: 'translate3d(0, 0, 0)', transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }
                : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        <ClassDetailHeader activity={activity} onClose={handleClose} />

        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs touch-momentum">
          <ClassDetailLocation activity={activity} isAppleDevice={isAppleDevice} />

          <ClassDetailLecturers activity={activity} />

          {activity.course_id && (
            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04]">
              <div className="w-8 h-8 rounded-xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[11px] font-medium text-[#86868b]">
                  Kod przedmiotu
                </h4>
                <p className="font-mono font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">
                  {activity.course_id}
                </p>
              </div>
            </div>
          )}
        </div>

        <ClassDetailFooter
          onDownloadICal={handleDownloadSingleICal}
          usoswebUrl={usoswebUrl}
        />
      </div>
    </div>
  );
};
