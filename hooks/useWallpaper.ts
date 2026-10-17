'use client';

import { useState, useEffect, useCallback } from 'react';

export function useWallpaper() {
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [bgBlur, setBgBlur] = useState<number>(8);
  const [bgDim, setBgDim] = useState<number>(35);

  useEffect(() => {
    try {
      const savedBg = localStorage.getItem('usos_custom_bg');
      if (savedBg) setCustomBg(savedBg);

      const savedBlur = localStorage.getItem('usos_bg_blur');
      if (savedBlur !== null) setBgBlur(parseInt(savedBlur, 10));

      const savedDim = localStorage.getItem('usos_bg_dim');
      if (savedDim !== null) setBgDim(parseInt(savedDim, 10));
    } catch {}
  }, []);

  const handleSetCustomBg = useCallback((url: string | null) => {
    setCustomBg(url);
    try {
      if (url) {
        localStorage.setItem('usos_custom_bg', url);
      } else {
        localStorage.removeItem('usos_custom_bg');
      }
    } catch {}
  }, []);

  const handleSetBgBlur = useCallback((val: number) => {
    setBgBlur(val);
    try {
      localStorage.setItem('usos_bg_blur', val.toString());
    } catch {}
  }, []);

  const handleSetBgDim = useCallback((val: number) => {
    setBgDim(val);
    try {
      localStorage.setItem('usos_bg_dim', val.toString());
    } catch {}
  }, []);

  return {
    isWallpaperModalOpen,
    setIsWallpaperModalOpen,
    customBg,
    bgBlur,
    bgDim,
    handleSetCustomBg,
    handleSetBgBlur,
    handleSetBgDim,
  };
}
