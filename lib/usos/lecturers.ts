import { USOSOAuthClient } from '@/lib/usos/oauth';
import { USOSLecturer } from '@/lib/usos/types';

export interface USOSLecturerInfo extends USOSLecturer {
  first_name: string;
  last_name: string;
  titles?: {
    before?: string | null;
    after?: string | null;
  };
  email?: string;
  formatted_name: string;
}

// In-memory cache for resolved lecturers across timetable requests
export const lecturerCache = new Map<string, USOSLecturerInfo>();

export function formatLecturerNameWithTitle(user: {
  first_name?: string;
  last_name?: string;
  titles?: {
    before?: string | null;
    after?: string | null;
  };
}): string {
  const titleBefore = user.titles?.before ? user.titles.before.trim() : '';
  const titleAfter = user.titles?.after ? user.titles.after.trim() : '';
  const firstName = user.first_name ? user.first_name.trim() : '';
  const lastName = user.last_name ? user.last_name.trim() : '';

  const nameParts: string[] = [];
  if (titleBefore) nameParts.push(titleBefore);
  if (firstName) nameParts.push(firstName);
  if (lastName) nameParts.push(lastName);

  let formatted = nameParts.filter(Boolean).join(' ');
  if (titleAfter) {
    formatted = `${formatted}, ${titleAfter}`;
  }
  return formatted || `${firstName} ${lastName}`.trim();
}

export async function resolveLecturers(
  client: USOSOAuthClient,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string | undefined,
  accessTokenSecret: string | undefined,
  lecturerIds: (number | string)[]
): Promise<Map<string, USOSLecturerInfo>> {
  const result = new Map<string, USOSLecturerInfo>();
  const missingIds: string[] = [];

  for (const rawId of lecturerIds) {
    const idStr = String(rawId);
    if (!idStr || idStr === 'undefined' || idStr === 'null') continue;
    if (lecturerCache.has(idStr)) {
      result.set(idStr, lecturerCache.get(idStr)!);
    } else {
      missingIds.push(idStr);
    }
  }

  if (missingIds.length === 0) {
    return result;
  }

  const uniqueMissing = Array.from(new Set(missingIds));
  const chunkSize = 25;

  for (let i = 0; i < uniqueMissing.length; i += chunkSize) {
    const chunk = uniqueMissing.slice(i, i + chunkSize);
    try {
      let userRes = await client.signedRequest({
        url: 'services/users/users',
        consumerKey,
        consumerSecret,
        token: accessToken,
        tokenSecret: accessTokenSecret,
        params: {
          user_ids: chunk.join('|'),
          fields: 'id|first_name|last_name|titles',
        },
      });

      if (!userRes || !userRes.ok) {
        console.warn('users/users with titles failed, status:', userRes?.status);
        userRes = await client.signedRequest({
          url: 'services/users/users',
          consumerKey,
          consumerSecret,
          token: accessToken,
          tokenSecret: accessTokenSecret,
          params: {
            user_ids: chunk.join('|'),
            fields: 'id|first_name|last_name',
          },
        });
      }

      if (userRes && userRes.ok) {
        const parsed = await userRes.json();
        console.log('users/users resolved batch count:', parsed && typeof parsed === 'object' ? Object.keys(parsed).length : 0);
        if (parsed && typeof parsed === 'object') {
          const entries = Array.isArray(parsed)
            ? parsed.map((u: any) => [String(u.id), u])
            : Object.entries(parsed);

          for (const [id, u] of entries) {
            if (u && typeof u === 'object') {
              const formatted = formatLecturerNameWithTitle(u as any);
              const info: USOSLecturerInfo = {
                id: (u as any).id || id,
                first_name: (u as any).first_name || '',
                last_name: (u as any).last_name || '',
                titles: (u as any).titles,
                email: (u as any).email,
                formatted_name: formatted,
              };
              lecturerCache.set(String(id), info);
              result.set(String(id), info);
            }
          }
        }
      } else {
        console.warn('users/users failed completely for chunk:', chunk);
      }
    } catch (e) {
      console.warn('Failed to resolve lecturers batch:', e);
    }
  }

  return result;
}
