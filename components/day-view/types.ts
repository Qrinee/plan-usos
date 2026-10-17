import { USOSActivity } from '@/lib/usos/types';

export interface DayItem {
  name: string;
  short: string;
  dayIndex: number;
  date: Date;
  dateStr: string;
  dayNum: number;
  isToday: boolean;
  count: number;
  weekOffset: number;
  weekMonday: Date;
}

export interface WeekDaysGroup {
  offset: number;
  weekMonday: Date;
  days: DayItem[];
}

export interface TimetableBreak {
  toActId: string;
  fromAct: USOSActivity;
  toAct: USOSActivity;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  isWindow: boolean;
}

export interface TimelineLayoutItem {
  activity: USOSActivity;
  start: Date;
  end: Date;
  startMin: number;
  endMin: number;
  topPx: number;
  heightPx: number;
  colIndex: number;
  totalCols: number;
}
