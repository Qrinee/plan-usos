import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';
import { analyzeCampusTransit, TransitAnalysis } from './transit';

export interface DayGap {
  start: Date;
  end: Date;
  durationMinutes: number;
  fromActivity: USOSActivity;
  toActivity: USOSActivity;
}

export interface DaySummary {
  todayActivities: USOSActivity[];
  totalActivities: number;
  completedCount: number;
  ongoingActivity: USOSActivity | null;
  nextActivity: USOSActivity | null;
  subsequentActivity: USOSActivity | null;
  progressPercent: number;
  firstStartTime: Date | null;
  lastEndTime: Date | null;
  dayEndsAtStr: string;
  remainingTimeStr: string;
  isDayFinished: boolean;
  hasNoClassesToday: boolean;
  gaps: DayGap[];
  totalGapMinutes: number;
  transitInfo: TransitAnalysis | null;
}

export function computeDaySummary(
  activities: USOSActivity[],
  now: Date = new Date()
): DaySummary {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  // Filter activities strictly for today
  const todayActivities = activities
    .filter((act) => {
      const start = parseDate(act.start_time);
      return (
        start.getFullYear() === currentYear &&
        start.getMonth() === currentMonth &&
        start.getDate() === currentDate
      );
    })
    .sort((a, b) => parseDate(a.start_time).getTime() - parseDate(b.start_time).getTime());

  if (todayActivities.length === 0) {
    return {
      todayActivities: [],
      totalActivities: 0,
      completedCount: 0,
      ongoingActivity: null,
      nextActivity: null,
      subsequentActivity: null,
      progressPercent: 0,
      firstStartTime: null,
      lastEndTime: null,
      dayEndsAtStr: '',
      remainingTimeStr: '',
      isDayFinished: false,
      hasNoClassesToday: true,
      gaps: [],
      totalGapMinutes: 0,
      transitInfo: null,
    };
  }

  const nowMs = now.getTime();
  const firstStartTime = parseDate(todayActivities[0].start_time);
  const lastEndTime = parseDate(todayActivities[todayActivities.length - 1].end_time);

  let completedCount = 0;
  let ongoingActivity: USOSActivity | null = null;
  let nextActivity: USOSActivity | null = null;
  let nextIndex = -1;

  for (let i = 0; i < todayActivities.length; i++) {
    const act = todayActivities[i];
    const start = parseDate(act.start_time).getTime();
    const end = parseDate(act.end_time).getTime();

    if (nowMs >= end) {
      completedCount++;
    } else if (nowMs >= start && nowMs < end) {
      ongoingActivity = act;
      nextIndex = i + 1;
    } else if (nowMs < start && !nextActivity) {
      nextActivity = act;
      nextIndex = i;
    }
  }

  const subsequentActivity =
    nextIndex >= 0 && nextIndex + 1 < todayActivities.length
      ? todayActivities[nextIndex + 1]
      : null;

  // Compute gaps / okienka (> 20 min break between consecutive classes)
  const gaps: DayGap[] = [];
  let totalGapMinutes = 0;

  for (let i = 0; i < todayActivities.length - 1; i++) {
    const currentEnd = parseDate(todayActivities[i].end_time);
    const nextStart = parseDate(todayActivities[i + 1].start_time);
    const diffMin = Math.round((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60));

    if (diffMin >= 20) {
      gaps.push({
        start: currentEnd,
        end: nextStart,
        durationMinutes: diffMin,
        fromActivity: todayActivities[i],
        toActivity: todayActivities[i + 1],
      });
      totalGapMinutes += diffMin;
    }
  }

  // Calculate day progress percentage
  const totalDaySpan = lastEndTime.getTime() - firstStartTime.getTime();
  let progressPercent = 0;

  if (nowMs <= firstStartTime.getTime()) {
    progressPercent = 0;
  } else if (nowMs >= lastEndTime.getTime()) {
    progressPercent = 100;
  } else if (totalDaySpan > 0) {
    const elapsed = nowMs - firstStartTime.getTime();
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDaySpan) * 100)));
  }

  const isDayFinished = nowMs >= lastEndTime.getTime();
  const dayEndsAtStr = lastEndTime.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let remainingTimeStr = '';
  if (!isDayFinished) {
    const diffMs = lastEndTime.getTime() - nowMs;
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffH > 0) {
      remainingTimeStr = `do końca: ${diffH}h ${diffM}min`;
    } else {
      remainingTimeStr = `do końca: ${diffM} min`;
    }
  } else {
    remainingTimeStr = 'Zajęcia zakończone 🎉';
  }

  // Campus transit calculation
  let transitInfo: TransitAnalysis | null = null;
  if (ongoingActivity && subsequentActivity) {
    transitInfo = analyzeCampusTransit(ongoingActivity, subsequentActivity);
  } else if (nextActivity && subsequentActivity) {
    transitInfo = analyzeCampusTransit(nextActivity, subsequentActivity);
  }

  return {
    todayActivities,
    totalActivities: todayActivities.length,
    completedCount,
    ongoingActivity,
    nextActivity,
    subsequentActivity,
    progressPercent,
    firstStartTime,
    lastEndTime,
    dayEndsAtStr,
    remainingTimeStr,
    isDayFinished,
    hasNoClassesToday: false,
    gaps,
    totalGapMinutes,
    transitInfo,
  };
}
