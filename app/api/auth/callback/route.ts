import { NextRequest, NextResponse } from 'next/server';
import { USOSOAuthClient } from '@/lib/usos/oauth';

export const dynamic = 'force-dynamic';

declare global {
  var __usos_pending_tokens: Map<string, { secret: string; consumerKey: string; consumerSecret: string }> | undefined;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const oauth_token = searchParams.get('oauth_token');
    const oauth_verifier = searchParams.get('oauth_verifier');

    if (!oauth_token || !oauth_verifier) {
      return NextResponse.redirect(new URL('/?auth_error=Brak_wymaganych_parametrow_autoryzacji', req.url));
    }

    let requestTokenSecret = '';
    let consumerKey = process.env.USOS_CONSUMER_KEY || '';
    let consumerSecret = process.env.USOS_CONSUMER_SECRET || '';

    const pendingFromMemory = globalThis.__usos_pending_tokens?.get(oauth_token);
    if (pendingFromMemory) {
      requestTokenSecret = pendingFromMemory.secret;
      consumerKey = pendingFromMemory.consumerKey || consumerKey;
      consumerSecret = pendingFromMemory.consumerSecret || consumerSecret;
      globalThis.__usos_pending_tokens?.delete(oauth_token);
    }

    if (!requestTokenSecret) {
      const tempCookie = req.cookies.get('usos_temp_oauth')?.value;
      if (tempCookie) {
        try {
          const parsedTemp = JSON.parse(tempCookie);
          requestTokenSecret = parsedTemp.oauth_token_secret;
          consumerKey = parsedTemp.consumerKey || consumerKey;
          consumerSecret = parsedTemp.consumerSecret || consumerSecret;
        } catch {}
      }
    }

    if (!requestTokenSecret) {
      return NextResponse.redirect(new URL('/?auth_error=Sesja_autoryzacji_wygasla_sprobuj_ponownie', req.url));
    }

    const client = new USOSOAuthClient();
    const { oauth_token: accessToken, oauth_token_secret: accessTokenSecret } =
      await client.getAccessToken({
        consumerKey,
        consumerSecret,
        requestToken: oauth_token,
        requestTokenSecret,
        oauthVerifier: oauth_verifier,
      });

    const sessionData = JSON.stringify({
      accessToken,
      accessTokenSecret,
      consumerKey,
      consumerSecret,
    });

    const redirectResponse = NextResponse.redirect(new URL('/?auth=success', req.url));

    redirectResponse.cookies.delete('usos_temp_oauth');

    redirectResponse.cookies.set('usos_session', sessionData, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return redirectResponse;
  } catch (error: any) {
    console.error('USOS Callback error:', error);
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error.message || 'Blad_wymiany_tokena')}`, req.url)
    );
  }
}
