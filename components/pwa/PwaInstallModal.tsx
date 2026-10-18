'use client';

import React from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md apple-card rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
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
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#fa243c] hover:bg-[#e11d48] text-white font-semibold text-xs transition-all shadow-md shadow-[#fa243c]/20 cursor-pointer"
          >
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  );
};
