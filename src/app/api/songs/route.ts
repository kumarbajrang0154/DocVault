import { NextRequest, NextResponse } from 'next/server';
import { getMatchingSongs } from '@/lib/publicData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = searchParams.get('language') || undefined;
  const mood = searchParams.get('mood') || undefined;

  const songs = await getMatchingSongs(language, mood);
  return NextResponse.json({ songs });
}
