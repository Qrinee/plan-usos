export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function parseDate(d: string): Date {
  return new Date(d.includes('T') ? d : d.replace(' ', 'T'));
}

export function formatDate(d: Date, options?: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString('pl-PL', options);
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
