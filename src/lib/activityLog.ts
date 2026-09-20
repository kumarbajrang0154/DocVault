import { db } from '@/lib/db';
import { getOwnerSession } from '@/lib/ownerAuth';

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown> | string
) {
  try {
    const session = await getOwnerSession();
    const userEmail = session?.user?.email || 'system@docvault.app';
    const detailString = typeof details === 'object' ? JSON.stringify(details) : details;

    await db.activityLog.create({
      data: {
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
