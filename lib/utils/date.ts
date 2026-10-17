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

/**
 * Returns the starting Monday for the timetable.
 * If today is Friday and all classes are finished, or if it is weekend (Saturday/Sunday),
 * automatically advances to next week's Monday so the student sees upcoming classes on start/refresh.
 */
export function getInitialMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const currentMonday = getMonday(now);

  // 1. If we are on Friday, Saturday, or Sunday, check cached timetable if available
  if (day === 5 || day === 6 || day === 0) {
    if (typeof window !== 'undefined') {
      try {
        const startStr = `${currentMonday.getFullYear()}-${(currentMonday.getMonth() + 1).toString().padStart(2, '0')}-${currentMonday.getDate().toString().padStart(2, '0')}`;
        const cachedRaw = localStorage.getItem(`usos_offline_timetable_${startStr}`);
        if (cachedRaw) {
          const acts = JSON.parse(cachedRaw);
          if (Array.isArray(acts) && acts.length > 0) {
            const nowMs = now.getTime();
            const hasUpcoming = acts.some((act: any) => {
              const endTime = parseDate(act.end_time).getTime();
              return endTime > nowMs;
            });
            // If all classes for this week have ended, start on next Monday
            if (!hasUpcoming) {
              const nextMonday = new Date(currentMonday);
              nextMonday.setDate(currentMonday.getDate() + 7);
              return nextMonday;
            } else {
              // Still has classes this weekend/today
              return currentMonday;
            }
          }
        }
      } catch { }
    }

    // If Saturday or Sunday without cached upcoming classes: default to next Monday
    if (day === 6 || day === 0) {
      const nextMonday = new Date(currentMonday);
      nextMonday.setDate(currentMonday.getDate() + 7);
      return nextMonday;
    }

    // If Friday evening (>= 18:00) without cache: classes are normally finished
    if (day === 5 && now.getHours() >= 18) {
      const nextMonday = new Date(currentMonday);
      nextMonday.setDate(currentMonday.getDate() + 7);
      return nextMonday;
    }
  }

  return currentMonday;
}
