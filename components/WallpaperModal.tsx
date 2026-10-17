'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Check,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';

interface WallpaperPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  thumb: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'sonoma-sunset',
    name: 'Sonoma Horizon',
    category: 'Apple macOS',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'sequoia-mist',
    name: 'Sequoia Forest',
    category: 'Natura',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'crimson-aura',
    name: 'Crimson',
    category: 'Abstrakcja',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'dark-waves',
    name: 'Deep Obsidian',
    category: 'Minimalizm',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'campus-arch',
    name: 'Nowoczesna Architektura',
    category: 'Kampus',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=75',
  },
  {
    id: 'cyber-neon',
    name: 'Neon Cyberpunk',
    category: 'Vibrant',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2560&q=85',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=75',
  },
];

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  customBg: string | null;
  onSetCustomBg: (url: string | null) => void;
  bgBlur: number;
  onSetBgBlur: (val: number) => void;
  bgDim: number;
  onSetBgDim: (val: number) => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  customBg,
  onSetCustomBg,
  bgBlur,
  onSetBgBlur,
  bgDim,
  onSetBgDim,
}) => {
  const [tab, setTab] = useState<'presets' | 'custom' | 'adjust'>('presets');
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Proszę wybrać plik graficzny (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Nie można przetworzyć obrazu');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          onSetCustomBg(compressedDataUrl);
          setIsProcessing(false);
        } catch (err: any) {
          console.error('Error compressing image:', err);
          setErrorMsg('Błąd przetwarzania obrazu. Spróbuj innego pliku.');
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMsg('Nie udało się wczytać wybranego obrazu.');
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMsg('Błąd odczytu pliku.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMsg('Wprowadź prawidłowy adres URL zaczynający się od https://');
      return;
    }
    setErrorMsg(null);
    onSetCustomBg(trimmed);
  };

  const handleResetToDefault = () => {
    onSetCustomBg(null);
    onSetBgBlur(8);
    onSetBgDim(35);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg apple-card rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        <div className="p-4 sm:p-5 relative border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#fa243c] to-[#fb5c74] text-white flex items-center justify-center shadow-xs">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Personalizacja Tła
              </h2>
              <p className="text-[11px] text-[#86868b]">
                Wybierz gotową tapetę lub wgraj własne zdjęcie
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 sm:p-3 bg-black/[0.015] dark:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center">
          <div className="apple-segmented-container p-0.5 grid grid-cols-3 w-full sm:w-auto sm:flex sm:space-x-1">
            <button
              onClick={() => setTab('presets')}
              className={`py-1.5 px-2 sm:px-3 sm:py-1 min-h-[34px] sm:min-h-0 rounded-full text-xs font-medium transition-all text-center cursor-pointer ${tab === 'presets'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
            >
              Kolekcja
            </button>
            <button
              onClick={() => setTab('custom')}
              className={`py-1.5 px-2 sm:px-3 sm:py-1 min-h-[34px] sm:min-h-0 rounded-full text-xs font-medium transition-all text-center cursor-pointer ${tab === 'custom'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
            >
              Własne tło
            </button>
            <button
              onClick={() => setTab('adjust')}
              className={`py-1.5 px-2 sm:px-3 sm:py-1 min-h-[34px] sm:min-h-0 rounded-full text-xs font-medium transition-all flex items-center justify-center space-x-1 cursor-pointer ${tab === 'adjust'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold scale-[1.02]'
                : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
            >
              <Sliders className="w-3.5 h-3.5 mr-1" />
              <span>Efekty</span>
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#fa243c]/10 text-[#fa243c] border border-[#fa243c]/20 text-[11px]">
              {errorMsg}
            </div>
          )}

          {tab === 'presets' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className={`group relative rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all duration-300 border overflow-hidden h-28 ${customBg === null
                    ? 'border-[#fa243c] ring-2 ring-[#fa243c]/20 bg-[#fa243c]/5'
                    : 'border-black/[0.06] dark:border-white/[0.08] hover:border-[#fa243c]/40 bg-black/[0.02] dark:bg-white/[0.03]'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fa243c] via-[#fb5c74] to-[#a855f7] opacity-80 group-hover:scale-110 transition-transform shadow-xs" />
                  <span className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] mt-2">
                    Domyślne tło
                  </span>
                  <span className="text-[10px] text-[#86868b]"></span>

                  {customBg === null && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#fa243c] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>

                {WALLPAPER_PRESETS.map((preset) => {
                  const isSelected = customBg === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSetCustomBg(preset.url)}
                      className={`group relative rounded-2xl p-2 flex flex-col justify-end text-left transition-all duration-300 border overflow-hidden h-28 ${isSelected
                        ? 'border-[#fa243c] ring-2 ring-[#fa243c]/20'
                        : 'border-black/[0.06] dark:border-white/[0.08] hover:border-[#fa243c]/40'
                        }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${preset.thumb})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      <div className="relative z-10 text-white">
                        <span className="font-semibold text-xs block leading-tight truncate">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-white/70 block">
                          {preset.category}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#fa243c] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'custom' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[#fa243c]/50 bg-black/[0.015] dark:bg-white/[0.02] hover:bg-[#fa243c]/[0.02] flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#fa243c]/10 text-[#fa243c] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">
                  Wgraj plik z dysku
                </h4>
                <p className="text-[11px] text-[#86868b] mt-1 max-w-xs">
                  Obsługiwane formaty: JPG, PNG, WebP. Obraz zostanie automatycznie zoptymalizowany.
                </p>
                {isProcessing && (
                  <span className="text-[11px] text-[#fa243c] font-medium mt-2 animate-pulse">
                    Przetwarzanie obrazu...
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-[#86868b] flex items-center space-x-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>Lub podaj bezpośredni link do obrazka:</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] text-xs focus:outline-none focus:ring-2 focus:ring-[#fa243c]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white font-semibold text-xs transition-all shadow-xs shrink-0 active:scale-95"
                  >
                    Ustaw
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'adjust' && (
            <div className="space-y-5 py-1">
              <div className="space-y-2 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Rozmycie tła (Blur)
                  </label>
                  <span className="font-mono text-xs font-bold text-[#fa243c]">
                    {bgBlur} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={bgBlur}
                  onChange={(e) => onSetBgBlur(parseInt(e.target.value, 10))}
                  className="w-full accent-[#fa243c] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#86868b]">
                  <span>Ostre (0px)</span>
                  <span>Delikatne (10px)</span>
                  <span>Mocne szkło (40px)</span>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Przyciemnienie / kontrast (Overlay)
                  </label>
                  <span className="font-mono text-xs font-bold text-[#fa243c]">
                    {bgDim} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={bgDim}
                  onChange={(e) => onSetBgDim(parseInt(e.target.value, 10))}
                  className="w-full accent-[#fa243c] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#86868b]">
                  <span>Jasne (0%)</span>
                  <span>Zrównoważone (35%)</span>
                  <span>Mroczne (90%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center space-x-1.5 px-3.5 py-2 min-h-[38px] rounded-full text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Domyślne tło</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 min-h-[38px] rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white text-xs font-semibold transition-all shadow-md shadow-[#fa243c]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
};
