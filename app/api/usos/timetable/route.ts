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

      const validFields = 'start_time|end_time|name|course_name|course_id|classtype_name|room_number|building_name|lecturer_ids|group_number';

      let res = await client.signedRequest({
        url: 'services/tt/student',
        consumerKey,
        consumerSecret,
        token: session.accessToken,
        tokenSecret: session.accessTokenSecret,
        params: {
          start,
          days,
          fields: validFields,
        },
      });

      if (!res.ok) {
        console.warn(`tt/student failed (${res.status}), trying services/tt/user...`);
        res = await client.signedRequest({
          url: 'services/tt/user',
          consumerKey,
          consumerSecret,
          token: session.accessToken,
          tokenSecret: session.accessTokenSecret,
          params: {
            start,
            days,
            fields: validFields,
          },
        });
      }

      if (!res.ok) {
        console.warn(`tt/user with fields failed (${res.status}), trying tt/student without fields parameter...`);
        res = await client.signedRequest({
          url: 'services/tt/student',
          consumerKey,
          consumerSecret,
          token: session.accessToken,
          tokenSecret: session.accessTokenSecret,
          params: {
            start,
            days,
          },
        });
      }

      if (res.ok) {
        const rawActivities = await res.json();
        if (Array.isArray(rawActivities)) {
          const formatted: USOSActivity[] = rawActivities.map(mapRawActivity);

          return NextResponse.json({
            activities: formatted,
            isLive: true,
            start,
            days,
            count: formatted.length,
          });
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.error(`USOS Timetable API returned status ${res.status}:`, errText);

        if (res.status === 401) {
          const resp = NextResponse.json({
            error: 'Sesja USOS wygasła. Zaloguj się ponownie.',
            activities: [],
            isLive: false,
          });
          resp.cookies.delete('usos_session');
          return resp;
        }

        return NextResponse.json({
          error: `Serwer USOS PRZ zwrócił błąd (${res.status}): ${errText}`,
          activities: [],
          isLive: true,
          start,
          days,
        });
      }
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
