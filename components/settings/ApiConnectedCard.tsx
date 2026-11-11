'use client';

import React from 'react';
import { CheckCircle, LogOut, WifiOff, RefreshCw } from 'lucide-react';
import { USOSUser } from '@/lib/usos/types';

interface ApiConnectedCardProps {
  user: USOSUser;
  isLive?: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onReauth?: () => void;
}

export const ApiConnectedCard: React.FC<ApiConnectedCardProps> = ({
  user,
  isLive = true,
  onRefresh,
  onLogout,
  onReauth,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border space-y-3 ${
        isLive
          ? 'bg-[#34c759]/10 border-[#34c759]/20'
          : 'bg-amber-500/10 border-amber-500/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center space-x-2 font-semibold text-sm ${
            isLive ? 'text-[#34c759]' : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {isLive ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Połączono z kontem USOS PRZ</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Zapisany profil (tryb offline)</span>
            </>
          )}
        </div>

        {!isLive && onReauth && (
          <button
            onClick={onReauth}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-semibold transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Zaloguj ponownie</span>
          </button>
        )}
      </div>

      <div className="text-xs text-[#1d1d1f] dark:text-[#f5f5f7] space-y-1">
        <p>
          <strong>Student:</strong> {user.first_name} {user.last_name}
        </p>
        {user.student_number && (
          <p>
            <strong>Nr albumu:</strong> {user.student_number}
          </p>
        )}
        {user.email && (
          <p>
            <strong>Email uczelniany:</strong> {user.email}
          </p>
        )}
        <p>
          <strong>Uczelnia:</strong> Politechnika Rzeszowska
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-full bg-white dark:bg-[#2c2c2e] hover:bg-black/[0.05] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs transition-all cursor-pointer"
        >
          Odśwież plan
        </button>
        <button
          onClick={onLogout}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#fa243c]/10 hover:bg-[#fa243c]/20 text-[#fa243c] text-xs font-medium transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Rozłącz konto</span>
        </button>
      </div>
    </div>
  );
};
