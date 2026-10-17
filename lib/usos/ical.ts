import { USOSActivity } from './types';

function formatICalDate(dateStr: string): string {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICalText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICalendar(activities: USOSActivity[], title: string = 'Plan Lekcji PRZ USOS'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Politechnika Rzeszowska//USOS Plan Lekcji//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(title)}`,
    'X-WR-TIMEZONE:Europe/Warsaw',
  ];

  const now = formatICalDate(new Date().toISOString());

  for (const act of activities) {
    const name = typeof act.name === 'string' ? act.name : act.name?.pl || 'Zajęcia';
    const classtype = typeof act.classtype_name === 'string' ? act.classtype_name : act.classtype_name?.pl || '';
    const room = act.room_number || '';
    const building = typeof act.building_name === 'string' ? act.building_name : act.building_name?.pl || '';
    const location = [building, room].filter(Boolean).join(', ');
    const lecturers = act.lecturer_names?.join(', ') || '';

    let description = `Typ: ${classtype}\n`;
    if (act.course_id) description += `Kod przedmiotu: ${act.course_id}\n`;
    if (lecturers) description += `Prowadzący: ${lecturers}\n`;
    if (act.group_number) description += `Grupa: ${act.group_number}\n`;
    if (act.note) description += `Notatka: ${act.note}\n`;
    description += `Politechnika Rzeszowska - USOSweb`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${act.id || Math.random().toString(36).substring(2)}@prz.usos.app`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${formatICalDate(act.start_time)}`);
    lines.push(`DTEND:${formatICalDate(act.end_time)}`);
    lines.push(`SUMMARY:${escapeICalText(`${name} (${classtype})`)}`);
    if (location) lines.push(`LOCATION:${escapeICalText(location)}`);
    lines.push(`DESCRIPTION:${escapeICalText(description)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
