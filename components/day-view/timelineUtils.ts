import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';
import { TimetableBreak, TimelineLayoutItem } from './types';

export const TIMELINE_START_HOUR = 7;
export const TIMELINE_END_HOUR = 21;
export const HOUR_HEIGHT = 80;
export const TOTAL_TIMELINE_HEIGHT = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * HOUR_HEIGHT;

export function formatBreakDuration(minutes: number): { short: string; full: string } {
  if (minutes < 60) {
    return {
      short: `${minutes} min`,
      full: `${minutes} min przerwy`,
    };
  }
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;

  let hoursStr = `${hours} godz.`;
  if (hours === 1) hoursStr = '1 godzina';
  else if (hours >= 2 && hours <= 4) hoursStr = `${hours} godziny`;
  else hoursStr = `${hours} godzin`;

  if (remMins === 0) {
    return {
      short: `${hours}h`,
      full: `${hoursStr} przerwy`,
    };
  }
  return {
    short: `${hours}h ${remMins} min`,
    full: `${hours}h ${remMins} min przerwy`,
  };
}

export function computeDayBreaks(activities: USOSActivity[]): TimetableBreak[] {
  if (activities.length < 2) return [];

  const breaks: TimetableBreak[] = [];
  let maxEndMs = parseDate(activities[0].end_time).getTime();
  let prevActForBreak = activities[0];
  let lastBreakEndMs = -1;

  for (let i = 1; i < activities.length; i++) {
    const act = activities[i];
    const startMs = parseDate(act.start_time).getTime();
    const endMs = parseDate(act.end_time).getTime();

    const diffMs = startMs - maxEndMs;
    const durationMinutes = Math.round(diffMs / (1000 * 60));

    if (durationMinutes > 0 && startMs !== lastBreakEndMs) {
      breaks.push({
        toActId: act.id,
        fromAct: prevActForBreak,
        toAct: act,
        startTime: new Date(maxEndMs),
        endTime: new Date(startMs),
        durationMinutes,
        isWindow: durationMinutes >= 45,
      });
      lastBreakEndMs = startMs;
    }

    if (endMs > maxEndMs) {
      maxEndMs = endMs;
      prevActForBreak = act;
    }
  }

  return breaks;
}

export function computeTimelineLayout(activities: USOSActivity[]): TimelineLayoutItem[] {
  if (activities.length === 0) return [];

  const items: TimelineLayoutItem[] = activities.map((act) => {
    const start = parseDate(act.start_time);
    const end = parseDate(act.end_time);
    const startMin = start.getHours() * 60 + start.getMinutes();
    const endMin = end.getHours() * 60 + end.getMinutes();
    const topPx = Math.max(0, ((startMin - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT);
    const heightPx = Math.max(48, ((endMin - startMin) / 60) * HOUR_HEIGHT);

    return {
      activity: act,
      start,
      end,
      startMin,
      endMin,
      topPx,
      heightPx,
      colIndex: 0,
      totalCols: 1,
    };
  });

  items.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  // Group overlapping items into visual clusters
  const clusters: TimelineLayoutItem[][] = [];
  let currentCluster: TimelineLayoutItem[] = [];
  let clusterEndMin = 0;

  for (const item of items) {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEndMin = item.endMin;
    } else if (item.startMin < clusterEndMin) {
      currentCluster.push(item);
      clusterEndMin = Math.max(clusterEndMin, item.endMin);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEndMin = item.endMin;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Assign columns for side-by-side overlapping events
  for (const cluster of clusters) {
    const columns: number[] = [];
    for (const item of cluster) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (columns[c] <= item.startMin) {
          item.colIndex = c;
          columns[c] = item.endMin;
          placed = true;
          break;
        }
      }
      if (!placed) {
        item.colIndex = columns.length;
        columns.push(item.endMin);
      }
    }
    const totalCols = Math.max(1, columns.length);
    for (const item of cluster) {
      item.totalCols = totalCols;
    }
  }

  return items;
}
