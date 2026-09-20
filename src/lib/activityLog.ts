import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/adminAuth';

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown> | string
) {
  try {
    const session = await getAdminSession();
    const adminEmail = session?.user?.email || 'system@mood.app';
    const detailString = typeof details === 'object' ? JSON.stringify(details) : details;

    await db.adminActivityLog.create({
      data: {
        adminEmail,
        action,
        entityType,
        entityId: entityId || null,
        details: detailString || null,
      },
    });
  } catch (error) {
    console.error('Failed to write admin activity log:', error);
  }
}
