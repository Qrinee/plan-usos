import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ items: [] });
    }

    const url = `https://usosapps.prz.edu.pl/services/courses/search?name=${encodeURIComponent(
      query.trim()
    )}&lang=pl`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Błąd USOS API (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Course search error:', error);
    return NextResponse.json(
      { error: error.message || 'Błąd podczas wyszukiwania przedmiotów' },
      { status: 500 }
    );
  }
}
