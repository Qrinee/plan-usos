import { NextRequest, NextResponse } from 'next/server';
import { USOSOAuthClient } from '@/lib/usos/oauth';
import { ClassType, USOSActivity } from '@/lib/usos/types';

export const dynamic = 'force-dynamic';

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

function mapRawActivity(act: any, index: number): USOSActivity {
  const { category, color } = assignCategoryAndColor(act);
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
    building_name: act.building_name,
    lecturer_ids: act.lecturer_ids,
    lecturer_names: act.lecturers
      ? act.lecturers.map((l: any) => `${l.first_name || ''} ${l.last_name || ''}`.trim())
      : undefined,
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

      const validFields = 'start_time|end_time|name|course_name|course_id|classtype_name|room_number|building_name|lecturers|lecturer_ids|group_number';

      const fetchEndpoint = async (endpoint: string, withFields: boolean) => {
        try {
          const params: Record<string, string | number> = { start, days };
          if (withFields) params.fields = validFields;
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

      let res = await fetchEndpoint('services/tt/student', true);
      if (!res || !res.ok) {
        if (res?.status === 401) is401 = true;
        // Retry without fields in case a field name is not supported
        res = await fetchEndpoint('services/tt/student', false);
      }

      if (res && res.ok) {
        try {
          const parsed = await res.json();
          if (Array.isArray(parsed)) studentActs = parsed;
        } catch {}
      } else if (res) {
        if (res.status === 401) is401 = true;
        lastError = await res.text().catch(() => '');
      }

      // 2. Also try services/tt/user (especially helpful for future weeks, seminars, consultations, or if studentActs is empty)
      let userActs: any[] = [];
      if (!is401) {
        let userRes = await fetchEndpoint('services/tt/user', true);
        if (!userRes || !userRes.ok) {
          if (userRes?.status === 401) is401 = true;
          userRes = await fetchEndpoint('services/tt/user', false);
        }
        if (userRes && userRes.ok) {
          try {
            const parsed = await userRes.json();
            if (Array.isArray(parsed)) userActs = parsed;
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
        const formatted: USOSActivity[] = rawCombined.map(mapRawActivity);
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
