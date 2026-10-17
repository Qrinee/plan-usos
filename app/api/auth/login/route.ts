import { NextRequest, NextResponse } from 'next/server';
import { USOSOAuthClient } from '@/lib/usos/oauth';

export const dynamic = 'force-dynamic';

declare global {
  var __usos_pending_tokens: Map<string, { secret: string; consumerKey: string; consumerSecret: string }> | undefined;
}

if (!globalThis.__usos_pending_tokens) {
  globalThis.__usos_pending_tokens = new Map();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    const consumerKey = (body.consumerKey || process.env.USOS_CONSUMER_KEY || '').trim();
    const consumerSecret = (body.consumerSecret || process.env.USOS_CONSUMER_SECRET || '').trim();

    if (!consumerKey || !consumerSecret) {
      return NextResponse.json(
        {
          error: 'Brak kluczy Consumer Key i Consumer Secret USOS API.',
          hint: 'Możesz je wygenerować na stronie https://usosapps.prz.edu.pl/developers/.',
        },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const callbackUrl = `${origin}/api/auth/callback`;

    const client = new USOSOAuthClient();
    const scopes = process.env.USOS_SCOPES || 'studies';

    const { oauth_token, oauth_token_secret } = await client.getRequestToken({
      consumerKey,
      consumerSecret,
      callbackUrl,
      scopes,
    });

    const redirectUrl = client.getAuthorizeUrl(oauth_token);

    globalThis.__usos_pending_tokens?.set(oauth_token, {
      secret: oauth_token_secret,
      consumerKey,
      consumerSecret,
    });

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      oauth_token,
    });

    const tempState = JSON.stringify({
      oauth_token_secret,
      consumerKey,
      consumerSecret,
    });

    response.cookies.set('usos_temp_oauth', tempState, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('USOS Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Nie udało się połączyć z USOS API PRZ' },
      { status: 500 }
    );
  }
}
