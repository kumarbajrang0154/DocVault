'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { logActivity } from '@/lib/activityLog';

export async function approveUserAction(userId: string) {
  const session = await requireAdmin();
  const adminEmail = session.user.email || 'admin';

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminEmail,
      },
    });

    await logActivity('USER_APPROVED', 'User', userId, {
      userEmail: updated.email,
      approvedBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true, user: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve user';
    return { success: false, error: message };
  }
}

export async function rejectUserAction(userId: string) {
  const session = await requireAdmin();
  const adminEmail = session.user.email || 'admin';

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminEmail,
      },
    });

    await logActivity('USER_REJECTED', 'User', userId, {
      userEmail: updated.email,
      rejectedBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true, user: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject user';
    return { success: false, error: message };
  }
}

export async function revokeUserAction(userId: string) {
  const session = await requireAdmin();
  const adminEmail = session.user.email || 'admin';

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminEmail,
      },
    });

    await logActivity('USER_REVOKED', 'User', userId, {
      userEmail: updated.email,
      revokedBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true, user: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revoke user access';
    return { success: false, error: message };
  }
}

export async function reconsiderUserAction(userId: string) {
  const session = await requireAdmin();
  const adminEmail = session.user.email || 'admin';

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        status: 'PENDING',
        reviewedAt: new Date(),
        reviewedBy: adminEmail,
      },
    });

    await logActivity('USER_RECONSIDERED', 'User', userId, {
      userEmail: updated.email,
      reconsideredBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true, user: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reconsider user';
    return { success: false, error: message };
  }
}

export async function getUsersListAction() {
  await requireAdmin();
  return await db.user.findMany({
    orderBy: { requestedAt: 'desc' },
  });
}
