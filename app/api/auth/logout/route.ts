import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Wylogowano z USOS' });
  response.cookies.delete('usos_session');
  response.cookies.delete('usos_temp_oauth');
  return response;
}
