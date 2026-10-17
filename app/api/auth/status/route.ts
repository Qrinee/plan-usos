import { NextRequest, NextResponse } from 'next/server';
import { USOSOAuthClient } from '@/lib/usos/oauth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('usos_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        mode: 'none',
      });
    }

    let session: {
      accessToken: string;
      accessTokenSecret: string;
      consumerKey: string;
      consumerSecret: string;
    };

    try {
      session = JSON.parse(sessionCookie);
    } catch {
      return NextResponse.json({
        authenticated: false,
        user: null,
        mode: 'none',
      });
    }

    if (!session.accessToken || !session.accessTokenSecret) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        mode: 'none',
      });
    }

    const client = new USOSOAuthClient();
    const res = await client.signedRequest({
      url: 'services/users/user',
      consumerKey: session.consumerKey || process.env.USOS_CONSUMER_KEY || '',
      consumerSecret: session.consumerSecret || process.env.USOS_CONSUMER_SECRET || '',
      token: session.accessToken,
      tokenSecret: session.accessTokenSecret,
      params: {
        fields: 'id|first_name|last_name|student_number|email',
      },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`USOS users/user returned ${res.status}: ${errText}`);

      if (res.status === 401) {
        const resp = NextResponse.json({
          authenticated: false,
          user: null,
          mode: 'none',
        });
        resp.cookies.delete('usos_session');
        return resp;
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: 'student_prz',
          first_name: 'Student',
          last_name: 'PRZ',
          student_number: '',
          email: '',
          faculty: 'Politechnika Rzeszowska',
        },
        mode: 'live',
      });
    }

    const userData = await res.json();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        student_number: userData.student_number || '',
        email: userData.email || '',
        faculty: 'Politechnika Rzeszowska',
      },
      mode: 'live',
    });
  } catch (error: any) {
    console.error('USOS Status error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        mode: 'none',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
