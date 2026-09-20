import { NextRequest, NextResponse } from 'next/server';
import { getMatchingSongs } from '@/lib/publicData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = searchParams.get('language') || undefined;
  const mood = searchParams.get('mood') || undefined;

  const rawSongs = await getMatchingSongs(language, mood);

  const songs = rawSongs.map((song) => {
    const isYouTubeUrl = (url?: string | null) =>
      Boolean(url && (url.includes('youtube.com') || url.includes('youtu.be')));

    // Resolve sourceUrl: if explicit sourceUrl, use it; else if audioUrl is YouTube, use audioUrl
    const sourceUrl =
      song.sourceUrl || (isYouTubeUrl(song.audioUrl) ? song.audioUrl : null);

    // Resolve streamUrl: ONLY valid audio URLs (never YouTube watch links)
    let streamUrl = song.streamUrl;
    if (!streamUrl && song.audioUrl && !isYouTubeUrl(song.audioUrl)) {
      streamUrl = song.audioUrl;
    }

    // Resolve downloadUrl: explicit downloadUrl, or non-YouTube audioUrl if marked downloadable
    let downloadUrl = song.downloadUrl;
    if (!downloadUrl && song.isDownloadable && song.audioUrl && !isYouTubeUrl(song.audioUrl)) {
      downloadUrl = song.audioUrl;
    }

    const hasPlayableAudio = Boolean(streamUrl);
    const isDownloadable = Boolean(song.isDownloadable && downloadUrl);

    return {
      ...song,
      sourceUrl,
      streamUrl,
      downloadUrl,
      hasPlayableAudio,
      isDownloadable,
    };
  });

  return NextResponse.json({ songs });
}
