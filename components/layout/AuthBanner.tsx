'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthBannerProps {
  banner: { type: 'success' | 'error'; message: string };
  onClose: () => void;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({ banner, onClose }) => {
  return (
    <div
      className={`p-3.5 px-4 rounded-2xl apple-glass border text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-300 ${
        banner.type === 'success'
          ? 'border-[#34c759]/30 text-[#34c759] bg-[#34c759]/[0.08]'
          : 'border-[#ff3b30]/30 text-[#ff3b30] bg-[#ff3b30]/[0.08]'
      }`}
    >
      <div className="flex items-center space-x-2">
        {banner.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-[#ff3b30] shrink-0" />
        )}
        <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
          {banner.message}
        </span>
      </div>
      <button
        onClick={onClose}
        className="text-[11px] font-medium px-2 py-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#86868b] cursor-pointer"
      >
        Zamknij
      </button>
    </div>
  );
};
