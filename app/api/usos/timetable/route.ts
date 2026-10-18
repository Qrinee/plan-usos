import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveTimetable } from '@/lib/usos/timetableService';

export const dynamic = 'force-dynamic';

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
      const result = await fetchLiveTimetable(session, start, days);

      if (result.status === 401) {
        const resp = NextResponse.json(
          {
            error: result.error,
            activities: [],
            isLive: false,
          },
          { status: 401 }
        );
        resp.cookies.delete('usos_session');
        return resp;
      }

      if (result.status === 502) {
        return NextResponse.json(
          {
            error: result.error,
            activities: [],
            isLive: true,
            start,
            days,
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        activities: result.activities,
        isLive: true,
        start,
        days,
        count: result.count,
      });
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
