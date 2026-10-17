'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';
import { computeDaySummary } from '@/lib/utils/daySummary';
import { NextActivityInfo } from './upcoming/types';
import { UpcomingActivityCard } from './upcoming/UpcomingActivityCard';
import { CampusTransitCard } from './upcoming/CampusTransitCard';
import { DayProgressBar } from './upcoming/DayProgressBar';

interface UpcomingBannerProps {
  activities: USOSActivity[];
  onSelectActivity: (act: USOSActivity) => void;
}

export const UpcomingBanner: React.FC<UpcomingBannerProps> = ({
  activities,
  onSelectActivity,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isApple =
        /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsAppleDevice(isApple);
    }

    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const daySummary = useMemo(() => {
    return computeDaySummary(activities, now);
  }, [activities, now]);

  const nextInfo = useMemo<NextActivityInfo | null>(() => {
    if (!activities || activities.length === 0) return null;

    const sorted = [...activities].sort(
      (a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime()
    );

    const ongoing = sorted.find((act) => {
      const start = parseDate(act.start_time);
      const end = parseDate(act.end_time);
      return now >= start && now <= end;
    });

    if (ongoing) {
      const start = parseDate(ongoing.start_time);
      const end = parseDate(ongoing.end_time);
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = Math.max(0, now.getTime() - start.getTime());
      const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      const remainingMin = Math.max(1, Math.round((end.getTime() - now.getTime()) / (1000 * 60)));

      return {
        status: 'ongoing',
        activity: ongoing,
        label: 'Zajęcia w toku',
        percent,
        elapsedStr: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        remainingStr: `pozostało ${remainingMin} min`,
        endStr: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const upcoming = sorted.find((act) => {
      const start = parseDate(act.start_time);
      return start > now;
    });

    if (upcoming) {
      const start = parseDate(upcoming.start_time);
      const end = parseDate(upcoming.end_time);
      const diffMs = start.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let timeNote = '';
      if (diffHours === 0) {
        timeNote = `za ${diffMins} min`;
      } else if (diffHours < 24) {
        timeNote = `za ${diffHours}h ${diffMins}min`;
      } else {
        const days = Math.round(diffHours / 24);
        timeNote = `za ${days} ${days === 1 ? 'dzień' : 'dni'}`;
      }

      return {
        status: 'upcoming',
        activity: upcoming,
        label: 'Najbliższe zajęcia',
        percent: 0,
        elapsedStr: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        remainingStr: timeNote,
        endStr: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    return null;
  }, [activities, now]);

  return (
    <div className="w-full space-y-2.5">
      <UpcomingActivityCard
        nextInfo={nextInfo}
        hasNoClassesToday={daySummary.hasNoClassesToday}
        onSelectActivity={onSelectActivity}
      />

      {daySummary.transitInfo && (
        <CampusTransitCard
          transit={daySummary.transitInfo}
          isAppleDevice={isAppleDevice}
        />
      )}

      <DayProgressBar daySummary={daySummary} />
    </div>
  );
};
