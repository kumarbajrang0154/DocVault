'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { logActivity } from '@/lib/activityLog';

const ADMIN_PROTECTION_ERROR =
  'Admin accounts cannot be modified, suspended, or deleted — including by themselves.';

async function checkAdminProtection(userId: string) {
  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new Error('User not found.');
  }
  if (targetUser.isAdmin) {
    throw new Error(ADMIN_PROTECTION_ERROR);
  }
  return targetUser;
}

export async function approveUserAction(userId: string) {
  try {
    const session = await requireAdmin();
    const adminEmail = session.user.email || 'admin';

    await checkAdminProtection(userId);

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
    await logActivity(
      'USER_APPROVE_FAILED',
      'User',
      userId,
      { error: message },
      'FAILURE'
    );
    return { success: false, error: message };
  }
}

export async function rejectUserAction(userId: string) {
  try {
    const session = await requireAdmin();
    const adminEmail = session.user.email || 'admin';

    await checkAdminProtection(userId);

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
    await logActivity(
      'USER_REJECT_FAILED',
      'User',
      userId,
      { error: message },
      'FAILURE'
    );
    return { success: false, error: message };
  }
}

export async function revokeUserAction(userId: string) {
  try {
    const session = await requireAdmin();
    const adminEmail = session.user.email || 'admin';

    await checkAdminProtection(userId);

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
    await logActivity(
      'USER_REVOKE_FAILED',
      'User',
      userId,
      { error: message },
      'FAILURE'
    );
    return { success: false, error: message };
  }
}

export async function reconsiderUserAction(userId: string) {
  try {
    const session = await requireAdmin();
    const adminEmail = session.user.email || 'admin';

    await checkAdminProtection(userId);

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
    await logActivity(
      'USER_RECONSIDER_FAILED',
      'User',
      userId,
      { error: message },
      'FAILURE'
    );
    return { success: false, error: message };
  }
}

export async function suspendUserAction(userId: string) {
  try {
    const session = await requireAdmin();
    const adminEmail = session.user.email || 'admin';

    await checkAdminProtection(userId);

    const updated = await db.user.update({
      where: { id: userId },
      data: { isSuspended: true },
    });

    await logActivity('USER_SUSPENDED', 'User', userId, {
      userEmail: updated.email,
      suspendedBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true, user: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to suspend user';
    await logActivity(
      'USER_SUSPEND_FAILED',
      'User',
      userId,
      { error: message },
      'FAILURE'
    );
    return { success: false, error: message };
  }
}

export async function unsuspendUserAction(userId: string) {
  try {
    const session = await requireAdmin();
    const adminEmail = session.user.email || 'admin';

    await checkAdminProtection(userId);

    const updated = await db.user.update({
      where: { id: userId },
      data: { isSuspended: false },
    });

    await logActivity('USER_UNSUSPENDED', 'User', userId, {
      userEmail: updated.email,
      unsuspendedBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true, user: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unsuspend user';
    await logActivity(
      'USER_UNSUSPEND_FAILED',
      'User',
      userId,
      { error: message },
      'FAILURE'
    );
    return { success: false, error: message };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await requireAdmin();
    const adminEmail = session.user.email || 'admin';

    await checkAdminProtection(userId);

    const deleted = await db.user.delete({
      where: { id: userId },
    });

    await logActivity('USER_DELETED', 'User', userId, {
      userEmail: deleted.email,
      deletedBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    await logActivity(
      'USER_DELETE_FAILED',
      'User',
      userId,
      { error: message },
      'FAILURE'
    );
    return { success: false, error: message };
  }
}

export async function getUsersListAction() {
  try {
    await requireAdmin();
    const users = await db.user.findMany({
      orderBy: { requestedAt: 'desc' },
    });
    return { success: true, users };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users list';
    return { success: false, error: message, users: [] };
  }
}
