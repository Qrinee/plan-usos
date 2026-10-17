import { NextRequest, NextResponse } from 'next/server';
import { USOSOAuthClient } from '@/lib/usos/oauth';
import { ClassType, USOSActivity, USOSLecturer } from '@/lib/usos/types';
import { extractBuildingCode, resolvePRZBuildings, PRZBuildingData } from '@/lib/usos/geo';

export const dynamic = 'force-dynamic';

interface USOSLecturerInfo {
  id: number | string;
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
const lecturerCache = new Map<string, USOSLecturerInfo>();

function formatLecturerNameWithTitle(user: {
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

async function resolveLecturers(
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

function assignCategoryAndColor(item: any): { category: ClassType; color: string } {
  const typeStr = (
    typeof item.classtype_name === 'object'
      ? item.classtype_name?.pl || ''
      : item.classtype_name || ''
  ).toLowerCase();

  const nameStr = (
    typeof item.name === 'object'
      ? item.name?.pl || ''
      : item.name || ''
  ).toLowerCase();

  if (typeStr.includes('wyk') || nameStr.includes('wykład')) {
    return { category: 'wykład', color: '#3b82f6' };
  }
  if (typeStr.includes('lab') || nameStr.includes('laboratorium')) {
    return { category: 'laboratorium', color: '#8b5cf6' };
  }
  if (typeStr.includes('ćwi') || typeStr.includes('cwi') || nameStr.includes('ćwiczenia')) {
    return { category: 'ćwiczenia', color: '#10b981' };
  }
  if (typeStr.includes('proj') || nameStr.includes('projekt')) {
    return { category: 'projekt', color: '#f59e0b' };
  }
  if (typeStr.includes('sem') || nameStr.includes('seminarium')) {
    return { category: 'seminarium', color: '#ec4899' };
  }
  if (typeStr.includes('lek') || nameStr.includes('angielski') || nameStr.includes('lektorat')) {
    return { category: 'lektorat', color: '#06b6d4' };
  }

  return { category: 'inne', color: '#64748b' };
}

function normalizeDateStr(d: string): string {
  if (!d) return '';
  return d.includes('T') ? d : d.replace(' ', 'T');
}

function mapRawActivity(
  act: any,
  index: number,
  lecturerMap?: Map<string, USOSLecturerInfo>,
  buildingMap?: Map<string, PRZBuildingData>
): USOSActivity {
  const { category, color } = assignCategoryAndColor(act);

  const rawBuildingName = typeof act.building_name === 'object' ? act.building_name?.pl || act.building_name?.en : act.building_name;
  const buildingCode = extractBuildingCode(act.building_id, rawBuildingName, act.room_number);
  const buildingInfo = buildingCode ? buildingMap?.get(buildingCode) : undefined;

  const resolvedBuildingName =
    buildingInfo?.name ||
    act.building_name ||
    (buildingCode ? `Budynek ${buildingCode}` : 'Politechnika Rzeszowska');

  const resolvedBuildingAddress = buildingInfo?.address;
  const resolvedBuildingLocation = buildingInfo?.location;

  const activityLecturers: USOSLecturer[] = [];
  const activityLecturerNames: string[] = [];

  const candidateIds = [
    ...(Array.isArray(act.lecturer_ids) ? act.lecturer_ids : []),
    ...(Array.isArray(act.lecturers) ? act.lecturers.map((l: any) => l?.id) : []),
  ].filter(Boolean);

  const seenLecIds = new Set<string>();
  for (const cid of candidateIds) {
    const idStr = String(cid);
    if (!seenLecIds.has(idStr)) {
      seenLecIds.add(idStr);
      const resolved = lecturerMap?.get(idStr);
      if (resolved) {
        activityLecturers.push(resolved);
        activityLecturerNames.push(resolved.formatted_name);
      }
    }
  }

  // Fallback to basic act.lecturers if lecturerMap didn't have titles
  if (activityLecturerNames.length === 0 && Array.isArray(act.lecturers) && act.lecturers.length > 0) {
    for (const l of act.lecturers) {
      const basicName = `${l.first_name || ''} ${l.last_name || ''}`.trim();
      if (basicName) {
        activityLecturerNames.push(basicName);
        activityLecturers.push({
          id: l.id || '',
          first_name: l.first_name || '',
          last_name: l.last_name || '',
          formatted_name: basicName,
        });
      }
    }
  }

  return {
    id: act.id || `live-act-${index}-${act.course_id || 'course'}`,
    type: act.type || 'classgroup',
    start_time: normalizeDateStr(act.start_time),
    end_time: normalizeDateStr(act.end_time),
    name: act.name || 'Zajęcia',
    course_name: act.course_name || act.name || 'Przedmiot',
    course_id: act.course_id,
    classtype_name: act.classtype_name || act.classtype || category,
    room_number: act.room_number,
    room_id: act.room_id,
    building_id: act.building_id || buildingCode || undefined,
    building_name: resolvedBuildingName,
    building_address: resolvedBuildingAddress,
    building_location: resolvedBuildingLocation,
    lecturer_ids: act.lecturer_ids,
    lecturer_names: activityLecturerNames.length > 0 ? activityLecturerNames : undefined,
    lecturers: activityLecturers.length > 0 ? activityLecturers : undefined,
    group_number: act.group_number,
    category,
    color,
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const start = searchParams.get('start') || new Date().toISOString().split('T')[0];
    const days = parseInt(searchParams.get('days') || '7', 10);

    const sessionCookie = req.cookies.get('usos_session')?.value;

    let session: any = null;
    if (sessionCookie) {
      try {
        session = JSON.parse(sessionCookie);
      } catch {}
    }

    const hasSession = !!(session && session.accessToken && session.accessTokenSecret);

    if (hasSession) {
      const client = new USOSOAuthClient();
      const consumerKey = session.consumerKey || process.env.USOS_CONSUMER_KEY;
      const consumerSecret = session.consumerSecret || process.env.USOS_CONSUMER_SECRET;

      const standardFields = 'type|start_time|end_time|name|course_id|classtype_name|room_number|room_id|building_name|building_id|lecturer_ids|group_number';
      const fallbackFields = 'start_time|end_time|name|room_number|room_id|building_name|building_id|lecturer_ids';

      const fetchEndpoint = async (endpoint: string, fieldsToUse?: string) => {
        try {
          const params: Record<string, string | number> = { start, days };
          if (fieldsToUse) params.fields = fieldsToUse;
          return await client.signedRequest({
            url: endpoint,
            consumerKey,
            consumerSecret,
            token: session.accessToken,
            tokenSecret: session.accessTokenSecret,
            params,
          });
        } catch (e) {
          console.warn(`Request to ${endpoint} threw:`, e);
          return null;
        }
      };

      // 1. Try services/tt/student
      let studentActs: any[] = [];
      let is401 = false;
      let lastError = '';

      let res = await fetchEndpoint('services/tt/student', standardFields);
      console.log('services/tt/student standardFields status:', res?.status);
      if (!res || !res.ok) {
        if (res?.status === 401) is401 = true;
        const errText = res ? await res.clone().text().catch(() => '') : '';
        console.warn('services/tt/student standardFields failed:', res?.status, errText);

        res = await fetchEndpoint('services/tt/student', fallbackFields);
        console.log('services/tt/student fallbackFields status:', res?.status);
        if (!res || !res.ok) {
          if (res?.status === 401) is401 = true;
          res = await fetchEndpoint('services/tt/student');
          console.log('services/tt/student without fields status:', res?.status);
        }
      }

      if (res && res.ok) {
        try {
          const parsed = await res.json();
          if (Array.isArray(parsed)) {
            studentActs = parsed;
            console.log('studentActs count:', studentActs.length);
            if (studentActs.length > 0) {
              console.log('Sample raw studentAct:', JSON.stringify(studentActs[0]));
            }
          }
        } catch {}
      } else if (res) {
        if (res.status === 401) is401 = true;
        lastError = await res.text().catch(() => '');
      }

      // 2. Also try services/tt/user (especially helpful for future weeks, seminars, consultations, or if studentActs is empty)
      let userActs: any[] = [];
      if (!is401) {
        let userRes = await fetchEndpoint('services/tt/user', standardFields);
        console.log('services/tt/user standardFields status:', userRes?.status);
        if (!userRes || !userRes.ok) {
          if (userRes?.status === 401) is401 = true;
          userRes = await fetchEndpoint('services/tt/user', fallbackFields);
          console.log('services/tt/user fallbackFields status:', userRes?.status);
          if (!userRes || !userRes.ok) {
            if (userRes?.status === 401) is401 = true;
            userRes = await fetchEndpoint('services/tt/user');
            console.log('services/tt/user without fields status:', userRes?.status);
          }
        }
        if (userRes && userRes.ok) {
          try {
            const parsed = await userRes.json();
            if (Array.isArray(parsed)) {
              userActs = parsed;
              console.log('userActs count:', userActs.length);
            }
          } catch {}
        }
      }

      if (is401) {
        const resp = NextResponse.json(
          {
            error: 'Sesja USOS wygasła. Zaloguj się ponownie.',
            activities: [],
            isLive: false,
          },
          { status: 401 }
        );
        resp.cookies.delete('usos_session');
        return resp;
      }

      // Merge and deduplicate activities from both endpoints
      const rawCombined: any[] = [];
      const seen = new Set<string>();

      for (const act of [...studentActs, ...userActs]) {
        const nameVal = typeof act.name === 'object' ? act.name?.pl || act.name?.en : act.name;
        const key = `${act.start_time}_${act.end_time}_${act.course_id || nameVal || ''}_${act.room_number || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          rawCombined.push(act);
        }
      }

      if (rawCombined.length > 0 || (res && res.ok)) {
        // Collect all lecturer IDs and building codes
        const allLecturerIds: (string | number)[] = [];
        const allBuildingCodes: string[] = [];

        for (const act of rawCombined) {
          if (Array.isArray(act.lecturer_ids)) {
            allLecturerIds.push(...act.lecturer_ids);
          }
          if (Array.isArray(act.lecturers)) {
            for (const lec of act.lecturers) {
              if (lec && (lec.id || lec.user_id)) {
                allLecturerIds.push(lec.id || lec.user_id);
              }
            }
          }

          const rawBName = typeof act.building_name === 'object' ? act.building_name?.pl || act.building_name?.en : act.building_name;
          const bCode = extractBuildingCode(act.building_id, rawBName, act.room_number);
          if (bCode) allBuildingCodes.push(bCode);
        }

        const [lecturerMap, buildingMap] = await Promise.all([
          resolveLecturers(
            client,
            consumerKey,
            consumerSecret,
            session.accessToken,
            session.accessTokenSecret,
            allLecturerIds
          ),
          resolvePRZBuildings(allBuildingCodes),
        ]);

        console.log('Resolved geo buildings map size:', buildingMap.size);

        const formatted: USOSActivity[] = rawCombined.map((act, idx) =>
          mapRawActivity(act, idx, lecturerMap, buildingMap)
        );
        if (formatted.length > 0) {
          console.log('Sample formatted activity lecturers:', formatted[0]?.lecturer_names);
        }

        return NextResponse.json({
          activities: formatted,
          isLive: true,
          start,
          days,
          count: formatted.length,
        });
      }

      // If both calls failed with non-200, return a 502 Bad Gateway so client knows not to cache empty array
      return NextResponse.json(
        {
          error: lastError || 'Nie udało się pobrać planu z serwera USOS.',
          activities: [],
          isLive: true,
          start,
          days,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      activities: [],
      isLive: false,
      start,
      days,
      count: 0,
      message: 'Zaloguj się przez USOS PRZ, aby pobrać swój plan zajęć.',
    });
  } catch (error: any) {
    console.error('Timetable API error:', error);
    return NextResponse.json(
      { error: error.message || 'Wystąpił błąd podczas pobierania planu lekcji.' },
      { status: 500 }
    );
  }
}
