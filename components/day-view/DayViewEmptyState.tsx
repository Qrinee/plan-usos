'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

export const DayViewEmptyState: React.FC = () => {
  return (
    <div className="py-20 text-center text-[#86868b] flex flex-col items-center justify-center min-h-[340px]">
      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-[#86868b]/40" />
      <p className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
        Wolne od zajęć
      </p>
      <p className="text-xs mt-1 text-[#86868b] max-w-xs">
        Brak zaplanowanych ćwiczeń, laboratoriów ani wykładów w tym dniu.
      </p>
    </div>
  );
};
