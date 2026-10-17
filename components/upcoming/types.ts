import { USOSActivity } from '@/lib/usos/types';

export interface NextActivityInfo {
  status: 'ongoing' | 'upcoming';
  activity: USOSActivity;
  label: string;
  percent: number;
  elapsedStr: string;
  remainingStr: string;
  endStr: string;
}
