export const WEEK_HOUR_HEIGHT = 68;

export interface WeekDayItem {
  name: string;
  short: string;
  offset: number;
  date: Date;
  dateStr: string;
  dayNum: number;
  monthShort: string;
  isToday: boolean;
}

export interface CurrentTimeInfo {
  top: number;
  timeString: string;
  inGrid: boolean;
}
