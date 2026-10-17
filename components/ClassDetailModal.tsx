'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Clock,
  MapPin,
  Building2,
  BookOpen,
  ExternalLink,
  Download,
  Navigation,
  Compass,
} from 'lucide-react';
import { USOSActivity } from '@/lib/usos/types';
import { generateICalendar } from '@/lib/usos/ical';
import { parseDate } from '@/lib/utils/date';

interface ClassDetailModalProps {
  activity: USOSActivity | null;
  onClose: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  activity: externalActivity,
  onClose,
}) => {
  const [renderedActivity, setRenderedActivity] = useState<USOSActivity | null>(externalActivity);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (externalActivity) {
      setRenderedActivity(externalActivity);
      setIsClosing(false);
      setDragY(0);
    } else {
      setRenderedActivity(null);
      setIsClosing(false);
      setDragY(0);
    }
  }, [externalActivity]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 230);
  }, [isClosing, onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    } else {
      setDragY(deltaY * 0.15);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    touchStartY.current = null;
    setIsDragging(false);
    if (dragY > 60) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  const [isAppleDevice, setIsAppleDevice] = useState(false);

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

  const start = parseDate(activity.start_time);
  const end = parseDate(activity.end_time);

  const dayFormatted = start.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diffMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}min` : ''}`.trim();

  const name = typeof activity.name === 'string' ? activity.name : activity.name?.pl || 'Zajęcia';
  const nameEn = typeof activity.name === 'object' ? activity.name?.en : undefined;

  const classtype =
    typeof activity.classtype_name === 'string'
      ? activity.classtype_name
      : activity.classtype_name?.pl || activity.category || 'Zajęcia';

  const room = activity.room_number || '';
  const building =
    typeof activity.building_name === 'string'
      ? activity.building_name
      : activity.building_name?.pl || 'Politechnika Rzeszowska';

  const baseColor = activity.color || '#fa243c';

  let specificBuilding = '';
  if (building && building !== 'Politechnika Rzeszowska') {
    specificBuilding = building;
  } else if (room) {
    const match = room.match(/^([A-Za-z]+)[-\s]/);
    if (match) {
      specificBuilding = `Budynek ${match[1].toUpperCase()}`;
    }
  }

  const mapParts: string[] = [];
  if (specificBuilding) {
    mapParts.push(specificBuilding);
  }
  mapParts.push('Politechnika Rzeszowska');
  mapParts.push('Rzeszów');
  const mapSearchQuery = mapParts.join(', ');

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(mapSearchQuery)}`;
  const defaultMapsUrl = isAppleDevice ? appleMapsUrl : googleMapsUrl;

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
      ? `https://usos.prz.edu.pl/kontroler.php?_action=katalog2/przedmioty/pokazPrzedmiot&kod=${encodeURIComponent(
        activity.course_id
      )}`
      : 'https://usos.prz.edu.pl/');

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

        <div className="p-5 sm:p-6 relative border-b border-black/[0.04] dark:border-white/[0.06]">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 sm:right-5 sm:top-5 w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span
              className="px-2.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${baseColor}15`, color: baseColor }}
            >
              {classtype}
            </span>
            {activity.group_number && (
              <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b] font-mono text-[11px]">
                Grupa {activity.group_number}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-2.5 leading-snug">
            {name}
          </h2>
          {nameEn && <p className="text-xs text-[#86868b] mt-0.5">{nameEn}</p>}

          <div className="flex items-center space-x-2 text-xs text-[#86868b] mt-3">
            <span className="flex items-center font-medium capitalize text-[#1d1d1f] dark:text-[#f5f5f7]">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#fa243c]" />
              {dayFormatted}
            </span>
            <span>•</span>
            <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {startTimeStr} – {endTimeStr}
            </span>
            <span>({durationStr})</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs touch-momentum">
          <div
            role="button"
            tabIndex={0}
            onClick={() => window.open(defaultMapsUrl, '_blank', 'noopener,noreferrer')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open(defaultMapsUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            title={`Kliknij, aby nawigować w ${isAppleDevice ? 'Apple Maps' : 'Google Maps'}: ${mapSearchQuery}`}
            className="group/map flex flex-col justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.04] hover:border-[#fa243c]/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs gap-3"
          >
            <div className="flex items-start space-x-3.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#fa243c]/10 text-[#fa243c] flex items-center justify-center shrink-0 group-hover/map:bg-[#fa243c] group-hover/map:text-white transition-all shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <h4 className="text-[11px] font-medium text-[#86868b]">
                    Miejsce zajęć
                  </h4>
                  <span className="text-[10px] text-[#fa243c] font-medium flex items-center space-x-1">
                    <span>• Nawiguj</span>
                    <Navigation className="w-2.5 h-2.5 inline" />
                  </span>
                </div>
                <p className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5 group-hover/map:text-[#fa243c] transition-colors">
                  {room ? `Sala: ${room}` : 'Sala niepodana'}
                </p>
                <p className="text-xs text-[#86868b] mt-0.5 flex items-center truncate">
                  <Building2 className="w-3.5 h-3.5 mr-1 inline opacity-70 shrink-0" />
                  <span className="truncate">{building}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                }}
                title="Otwórz w Google Maps"
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-[#4285F4]/15 hover:text-[#4285F4] text-[#86868b] text-[11px] font-medium transition-all active:scale-95"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(appleMapsUrl, '_blank', 'noopener,noreferrer');
                }}
                title="Otwórz w Apple Maps"
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-[#fa243c]/15 hover:text-[#fa243c] text-[#86868b] text-[11px] font-medium transition-all active:scale-95"
              >
                <span>Apple Maps</span>
                <Compass className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>

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

        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={handleDownloadSingleICal}
            className="flex items-center space-x-1.5 px-3.5 py-2 min-h-[40px] rounded-full hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#fa243c]" />
            <span>Pobierz .ics</span>
          </button>

          <a
            href={usoswebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2 min-h-[40px] rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white text-xs font-medium transition-all shadow-md shadow-[#fa243c]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Otwórz w USOSweb</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
