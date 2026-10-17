import { USOSActivity } from '@/lib/usos/types';
import { parseDate } from '@/lib/utils/date';

export interface FormattedListItem {
  id: string;
  activity: USOSActivity;
  name: string;
  classtype: string;
  room: string;
  building: string;
  lecturers: string;
  dayName: string;
  dayNameShort: string;
  startTimeStr: string;
  endTimeStr: string;
  durationStr: string;
  isPast: boolean;
  isCurrent: boolean;
  baseColor: string;
  groupNumber?: string | number;
  courseId?: string;
}

export function formatListItem(act: USOSActivity, now: Date): FormattedListItem {
  const start = parseDate(act.start_time);
  const end = parseDate(act.end_time);

  const isPast = end.getTime() < now.getTime();
  const isCurrent = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
  const baseColor = act.color || '#fa243c';

  const dayName = start.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  });
  const dayNameShort = start.toLocaleDateString('pl-PL', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });
  const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const diffMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  const durationStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60 ? `${diffMin % 60}m` : ''}`.trim();

  const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
  const classtype =
    typeof act.classtype_name === 'string'
      ? act.classtype_name
      : act.classtype_name?.pl || act.category || '';
  const room = act.room_number || '';
  const building =
    typeof act.building_name === 'string' ? act.building_name : act.building_name?.pl || '';
  const lecturers = act.lecturer_names?.join(', ') || 'Politechnika Rzeszowska';

  return {
    id: act.id,
    activity: act,
    name,
    classtype,
    room,
    building,
    lecturers,
    dayName,
    dayNameShort,
    startTimeStr,
    endTimeStr,
    durationStr,
    isPast,
    isCurrent,
    baseColor,
    groupNumber: act.group_number,
    courseId: act.course_id,
  };
}
