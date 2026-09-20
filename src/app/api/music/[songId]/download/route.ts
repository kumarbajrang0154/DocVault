import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ songId: string }> }
) {
  const { songId } = await params;

  if (!songId) {
    return NextResponse.json({ error: 'Song ID is required.' }, { status: 400 });
  }

  try {
    const song = await db.song.findUnique({
      where: { id: songId },
      include: { artist: true },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found.' }, { status: 404 });
    }

    const downloadTargetUrl = song.downloadUrl || song.streamUrl;

    if (!song.isDownloadable || !downloadTargetUrl) {
      return NextResponse.json(
        { error: 'Download is unavailable or not permitted for this track.' },
        { status: 403 }
      );
    }

    // Do not proxy YouTube watch URLs or non-audio Webpages
    if (downloadTargetUrl.includes('youtube.com') || downloadTargetUrl.includes('youtu.be')) {
      return NextResponse.json(
        { error: 'Invalid audio download URL configured.' },
        { status: 400 }
      );
    }

    const fileRes = await fetch(downloadTargetUrl);
    if (!fileRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch audio file from storage server.' },
        { status: 502 }
      );
    }

    const contentType = fileRes.headers.get('content-type') || 'audio/mpeg';
    const arrayBuffer = await fileRes.arrayBuffer();

    const sanitizedTitle = song.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedArtist = song.artist?.name ? song.artist.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Mood';
    const filename = `${sanitizedArtist}_-_${sanitizedTitle}.mp3`;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Server error processing download request.' },
      { status: 500 }
    );
  }
}
