'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { PwaOfflineBanner } from './pwa/PwaOfflineBanner';
import { PwaInstallModal } from './pwa/PwaInstallModal';
import { PwaBottomBanner } from './pwa/PwaBottomBanner';

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
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {!isOnline && <PwaOfflineBanner />}

      {showInstalledToast && (
        <div className="fixed bottom-5 right-5 z-50 apple-glass rounded-2xl p-4 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs shadow-xl flex items-center space-x-2.5 animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-semibold">
            Plan Lekcji został zainstalowany na Twoim urządzeniu!
          </span>
        </div>
      )}

      <PwaInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isIOS={isIOS}
      />

      {!isStandalone && !isDismissed && (deferredPrompt || isIOS) && (
        <PwaBottomBanner
          onInstall={handleInstallClick}
          onDismiss={() => setIsDismissed(true)}
        />
      )}
    </>
  );
};
