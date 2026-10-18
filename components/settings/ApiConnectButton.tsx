'use client';

import React from 'react';
import { KeyRound, Loader2 } from 'lucide-react';

interface ApiConnectButtonProps {
  loading: boolean;
  onConnect: () => void;
}

export const ApiConnectButton: React.FC<ApiConnectButtonProps> = ({
  loading,
  onConnect,
}) => {
  return (
    <button
      onClick={onConnect}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-full bg-gradient-to-r from-[#fa243c] to-[#fb5c74] hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-[#fa243c]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Łączenie z USOSapps PRZ...</span>
        </>
      ) : (
        <>
          <KeyRound className="w-4 h-4" />
          <span>Zaloguj przez USOS Politechniki Rzeszowskiej</span>
        </>
      )}
    </button>
  );
};
