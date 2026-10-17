'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, WifiOff, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInstalledToast, setShowInstalledToast] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowInstalledToast(true);
      setTimeout(() => setShowInstalledToast(false), 4000);
    });

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Plan PRz Service Worker zarejestrowany:', reg.scope);
        })
        .catch((err) => {
          console.warn('Błąd rejestracji Service Workera:', err);
        });
    }

    const handleOpenInstall = () => {
      handleInstallClick();
    };
    window.addEventListener('open-pwa-install', handleOpenInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install', handleOpenInstall);
    };
  }, [deferredPrompt, isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {!isOnline && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/25 px-4 py-2 text-xs flex items-center justify-between text-amber-600 dark:text-amber-400 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
            <span className="font-medium">
              Jesteś w trybie offline. Aplikacja korzysta z zapisanego planu lekcji i sal Politechniki Rzeszowskiej.
            </span>
          </div>
        </div>
      )}

      {showInstalledToast && (
        <div className="fixed bottom-5 right-5 z-50 apple-glass rounded-2xl p-4 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs shadow-xl flex items-center space-x-2.5 animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-semibold">
            Plan Lekcji został zainstalowany na Twoim urządzeniu!
          </span>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md apple-card rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fa243c] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-[#fa243c]/20">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Zainstaluj Plan PRz
                </h3>
                <p className="text-xs text-[#86868b]">
                  Dostęp do planu offline i pełnoekranowy widok
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 pt-2 text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                <p className="text-[#86868b]">
                  Aby zainstalować aplikację na iPhonie lub iPadzie (Safari):
                </p>
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05]">
                  <Share className="w-5 h-5 text-[#007AFF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Krok 1:</span> Kliknij ikonę{' '}
                    <span className="font-semibold text-[#007AFF]">Udostępnij</span> na dolnym pasku Safari.
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05]">
                  <PlusSquare className="w-5 h-5 text-[#fa243c] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Krok 2:</span> Przewiń w dół i wybierz{' '}
                    <span className="font-semibold">Do ekranu początkowego</span>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2 text-xs text-[#86868b]">
                <p>
                  W przeglądarce Chrome, Edge lub Brave kliknij ikonę instalacji na pasku adresu lub wybierz z menu opcję: <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Zainstaluj Plan Zajęć PRz</strong>.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#fa243c] hover:bg-[#e11d48] text-white font-semibold text-xs transition-all shadow-md shadow-[#fa243c]/20 cursor-pointer"
              >
                Rozumiem
              </button>
            </div>
          </div>
        </div>
      )}

      {!isStandalone && !isDismissed && (deferredPrompt || isIOS) && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-sm apple-glass rounded-2xl p-3 sm:p-3.5 border border-black/[0.08] dark:border-white/[0.1] shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fa243c] to-[#fb5c74] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#fa243c]/30">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                Zainstaluj aplikację
              </h4>
              <p className="text-[11px] text-[#86868b] truncate">
                Plan lekcji offline na Twoim ekranie
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-full bg-[#fa243c] hover:bg-[#e11d48] text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Zainstaluj
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Zamknij"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
