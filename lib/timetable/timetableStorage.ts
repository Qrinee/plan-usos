import { USOSActivity, USOSUser } from '@/lib/usos/types';

export const TIMETABLE_CACHE_PREFIX = 'usos_offline_timetable_v3_';
const LAST_SYNC_KEY = 'usos_last_sync_time';
const CACHED_USER_KEY = 'usos_cached_user';

export function cleanLegacyTimetableCaches(): void {
  if (typeof window === 'undefined') return;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('usos_offline_timetable_') && !key.startsWith(TIMETABLE_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {}
}

export function getSavedSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

export function saveSyncTime(isoString: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SYNC_KEY, isoString);
  } catch {}
}

export function getCachedUser(): USOSUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedUser(user: USOSUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
  } catch {}
}

export function getCachedWeekActivities(startStr: string, requireLecturers = true): USOSActivity[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cachedRaw = localStorage.getItem(`${TIMETABLE_CACHE_PREFIX}${startStr}`);
    if (!cachedRaw) return null;
    const cachedActs: USOSActivity[] = JSON.parse(cachedRaw);
    if (!Array.isArray(cachedActs)) return null;

    if (requireLecturers) {
      const hasLecturers = cachedActs.some(
        (a: any) => (a.lecturer_names && a.lecturer_names.length > 0) || (a.lecturers && a.lecturers.length > 0)
      );
      if (!hasLecturers) return null;
    }

    return cachedActs;
  } catch {
    return null;
  }
}

export function saveCachedWeekActivities(startStr: string, acts: USOSActivity[]): void {
  if (typeof window === 'undefined' || !acts || acts.length === 0) return;
  try {
    localStorage.setItem(`${TIMETABLE_CACHE_PREFIX}${startStr}`, JSON.stringify(acts));
  } catch (e) {
    console.warn('Could not cache timetable in localStorage:', e);
  }
}

export function getAnyFallbackActivities(): USOSActivity[] | null {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(TIMETABLE_CACHE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const acts = JSON.parse(raw);
          if (Array.isArray(acts) && acts.length > 0) {
            return acts;
          }
        }
      }
    }
  } catch {}
  return null;
}
