'use client';

import React from 'react';

interface WallpaperBackgroundProps {
  customBg: string | null;
  bgBlur: number;
  bgDim: number;
  darkMode: boolean;
}

export const WallpaperBackground: React.FC<WallpaperBackgroundProps> = ({
  customBg,
  bgBlur,
  bgDim,
  darkMode,
}) => {
  if (customBg) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -inset-6 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
          style={{
            backgroundImage: `url(${customBg})`,
            filter: `blur(${bgBlur}px)`,
            transform: 'scale(1.06)',
          }}
        />
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            backgroundColor: darkMode
              ? `rgba(0, 0, 0, ${bgDim / 100})`
              : `rgba(255, 255, 255, ${Math.min(0.65, (bgDim / 100) * 0.7)})`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="apple-music-aura">
      <div className="apple-music-aura-1" />
      <div className="apple-music-aura-2" />
    </div>
  );
};
