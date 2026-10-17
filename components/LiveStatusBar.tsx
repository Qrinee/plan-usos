'use client';

import React, { useState, useEffect } from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface LiveStatusBarProps {
  activities: USOSActivity[];
  isOfflineLoaded?: boolean;
  lastSyncTime?: string | null;
}

export const LiveStatusBar: React.FC<LiveStatusBarProps> = ({
  activities,
  isOfflineLoaded = false,
  lastSyncTime,
}) => {
  const isOnline = useOnlineStatus();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = now.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const formatSyncTime = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const syncTimeFormatted = formatSyncTime(lastSyncTime);
  const isOperatingOffline = !isOnline || isOfflineLoaded;

  return (
    <div className="w-full flex items-center justify-between flex-wrap gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-2xl apple-glass text-xs transition-all duration-300 border border-black/[0.03] dark:border-white/[0.05]">
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight font-mono text-xs">
            {timeStr}
          </span>
        </div>

        <span className="text-black/20 dark:text-white/20">•</span>

        <span className="text-[#86868b] font-medium capitalize flex items-center space-x-1 text-xs truncate">
          <span>{dateStr}</span>
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 text-[11px]">
        {/* Offline / Online badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-medium transition-all ${
            isOperatingOffline
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {isOperatingOffline ? (
            <>
              <WifiOff className="w-3 h-3 shrink-0 animate-pulse" />
              <span>Offline (Cache)</span>
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 shrink-0" />
              <span>Połączono z USOS</span>
            </>
          )}
        </div>

        {syncTimeFormatted && (
          <span className="text-[#86868b] hidden sm:inline flex items-center space-x-1">
            <RefreshCw className="w-2.5 h-2.5 inline opacity-60" />
            <span>Zapis: {syncTimeFormatted}</span>
          </span>
        )}

        <span className="text-[#86868b] hidden md:inline">
          {activities.length} {activities.length === 1 ? 'zajęcia' : 'zajęć w planie'}
        </span>
      </div>
    </div>
  );
};
