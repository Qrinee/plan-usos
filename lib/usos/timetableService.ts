import { USOSOAuthClient } from '@/lib/usos/oauth';
import { USOSActivity } from '@/lib/usos/types';
import { extractBuildingCode, resolvePRZBuildings } from '@/lib/usos/geo';
import { resolveLecturers } from './lecturers';
import { mapRawActivity } from './mapper';

export interface UsosSessionData {
  accessToken: string;
  accessTokenSecret: string;
  consumerKey?: string;
  consumerSecret?: string;
}

export type UsosTimetableServiceResult =
  | {
      status: 200;
      activities: USOSActivity[];
      isLive: boolean;
      start: string;
      days: number;
      count: number;
    }
  | {
      status: 401;
      error: string;
      activities: [];
      isLive: false;
    }
  | {
      status: 502;
      error: string;
      activities: [];
      isLive: boolean;
      start: string;
      days: number;
    };

export async function fetchLiveTimetable(
  session: UsosSessionData,
  start: string,
  days: number
): Promise<UsosTimetableServiceResult> {
  const client = new USOSOAuthClient();
  const consumerKey = session.consumerKey || process.env.USOS_CONSUMER_KEY || '';
  const consumerSecret = session.consumerSecret || process.env.USOS_CONSUMER_SECRET || '';

  const standardFields =
    'type|start_time|end_time|name|course_id|classtype_name|room_number|room_id|building_name|building_id|lecturer_ids|group_number';
  const fallbackFields =
    'start_time|end_time|name|room_number|room_id|building_name|building_id|lecturer_ids';

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
    return {
      status: 401,
      error: 'Sesja USOS wygasła. Zaloguj się ponownie.',
      activities: [],
      isLive: false,
    };
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

      const rawBName =
        typeof act.building_name === 'object'
          ? act.building_name?.pl || act.building_name?.en
          : act.building_name;
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

    return {
      status: 200,
      activities: formatted,
      isLive: true,
      start,
      days,
      count: formatted.length,
    };
  }

  return {
    status: 502,
    error: lastError || 'Nie udało się pobrać planu z serwera USOS.',
    activities: [],
    isLive: true,
    start,
    days,
  };
}
