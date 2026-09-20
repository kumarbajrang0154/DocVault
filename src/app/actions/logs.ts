'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';

export async function getMoreAdminLogsAction(skip: number = 0, take: number = 50) {
  try {
    await requireAdmin();

    const logs = await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const serializableLogs = logs.map((log) => ({
      ...log,
      status: log.status || ('SUCCESS' as const),
      createdAt: log.createdAt.toISOString(),
    }));

    return { success: true, logs: serializableLogs };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch additional logs';
    return { success: false, error: message, logs: [] };
  }
}
