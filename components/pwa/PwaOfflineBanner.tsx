'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';

export const PwaOfflineBanner: React.FC = () => {
  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/25 px-4 py-2 text-xs flex items-center justify-between text-amber-600 dark:text-amber-400 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
        <span className="font-medium">
          Jesteś w trybie offline. Aplikacja korzysta z zapisanego planu lekcji i sal Politechniki Rzeszowskiej.
        </span>
      </div>
    </div>
  );
};
