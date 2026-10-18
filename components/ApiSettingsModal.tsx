'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { USOSUser } from '@/lib/usos/types';
import { ApiConnectedCard } from './settings/ApiConnectedCard';
import { ApiConnectButton } from './settings/ApiConnectButton';
import { ApiSecurityNote } from './settings/ApiSecurityNote';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLive: boolean;
  user: USOSUser | null;
  onLogout: () => void;
  onRefresh: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  isLive,
  user,
  onLogout,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartOAuth = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Błąd inicjowania logowania USOS');
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd autoryzacji';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
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
        {/* Mobile drag bar */}
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#fa243c] to-[#fb5c74] text-white flex items-center justify-center shadow-md shadow-[#fa243c]/20">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                Połączenie z USOS PRZ
              </h3>
              <p className="text-xs text-[#86868b]">
                Autoryzacja OAuth 1.0a i integracja z planem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {isLive && user ? (
            <ApiConnectedCard
              user={user}
              onRefresh={onRefresh}
              onLogout={onLogout}
            />
          ) : (
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <div className="flex items-center space-x-2 text-[#fa243c] font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Konto nie jest połączone</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Połącz swoje konto studenta Politechniki Rzeszowskiej przez oficjalną autoryzację USOS PRZ, aby pobrać swój aktualny plan zajęć, przedmioty i sale.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-[#fa243c]/10 border border-[#fa243c]/20 text-[#fa243c] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isLive && (
            <div className="space-y-4 pt-2">
              <ApiConnectButton
                loading={loading}
                onConnect={handleStartOAuth}
              />
              <ApiSecurityNote />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <a
            href="https://buycoffee.to/qrin-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#86868b] hover:text-[#fa243c] flex items-center space-x-1 py-1"
          >
            <span>Buy Coffee</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 min-h-[38px] rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] active:scale-95 transition-all cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
