import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/authGuard';

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown> | string
) {
  try {
    const session = await getAuthSession();
    const userEmail = session?.user?.email || 'system@docvault.app';
    const userId = session?.user?.id || null;
    const detailString = typeof details === 'object' ? JSON.stringify(details) : details;

    await db.activityLog.create({
      data: {
        userId,
        userEmail,
        action,
        entityType,
        entityId: entityId || null,
        details: detailString || null,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}

export const logAdminAction = logActivity;
