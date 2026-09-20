import { NextResponse } from 'next/server';
import { runDiscoveryAction } from '@/app/admin/actions/ai';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server.' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.replace('Bearer ', '').trim();
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('secret');

  if (tokenFromHeader !== cronSecret && tokenFromQuery !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron secret provided.' },
      { status: 401 }
    );
  }

  try {
    const query = url.searchParams.get('q') || 'new music 2026';
    const result = await runDiscoveryAction(query);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Scheduled discovery execution failed.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
