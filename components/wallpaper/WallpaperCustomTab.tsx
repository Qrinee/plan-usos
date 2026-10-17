'use client';

import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface WallpaperCustomTabProps {
  onSetCustomBg: (url: string) => void;
}

export const WallpaperCustomTab: React.FC<WallpaperCustomTabProps> = ({ onSetCustomBg }) => {
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        } catch (err) {
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

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-[#fa243c]/10 border border-[#fa243c]/20 text-[#fa243c] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* File Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-6 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-[#fa243c]/50 dark:hover:border-[#fa243c]/50 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] group-hover:bg-[#fa243c]/15 text-[#86868b] group-hover:text-[#fa243c] flex items-center justify-center transition-all mb-2.5">
          <Upload className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          {isProcessing ? 'Przetwarzanie obrazu...' : 'Wybierz zdjęcie z urządzenia'}
        </h4>
        <p className="text-[11px] text-[#86868b] mt-0.5">
          Obsługiwane formaty: JPG, PNG, WebP (optymalizowane lokalnie)
        </p>
      </div>

      {/* URL Input Box */}
      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
        <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center space-x-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-[#86868b]" />
          <span>Lub podaj bezpośredni link do tapety</span>
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#fa243c]/30"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 rounded-xl bg-[#fa243c] hover:bg-[#fb5c74] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            Zastosuj
          </button>
        </div>
      </div>
    </div>
  );
};
