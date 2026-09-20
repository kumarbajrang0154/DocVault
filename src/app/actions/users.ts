'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { logActivity } from '@/lib/activityLog';

export async function addAuthorizedEmailAction(emailRaw: string) {
  const session = await requireAdmin();
  const adminEmail = session.user?.email || 'admin';

  const email = emailRaw?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const entry = await db.authorizedEmail.upsert({
      where: { email },
      update: {},
      create: {
        email,
        addedByAdmin: adminEmail,
        hasLoggedIn: false,
      },
    });

    await logActivity('AUTHORIZED_EMAIL_ADDED', 'AuthorizedEmail', entry.id, {
      email,
      addedByAdmin: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true, entry };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to authorize email';
    return { success: false, error: message };
  }
}

export async function revokeAuthorizedEmailAction(id: string) {
  const session = await requireAdmin();
  const adminEmail = session.user?.email || 'admin';

  const entry = await db.authorizedEmail.findUnique({ where: { id } });
  if (!entry) {
    return { success: false, error: 'Authorized email entry not found.' };
  }

  try {
    await db.authorizedEmail.delete({ where: { id } });

    await logActivity('AUTHORIZED_EMAIL_REVOKED', 'AuthorizedEmail', id, {
      email: entry.email,
      revokedBy: adminEmail,
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revoke email authorization';
    return { success: false, error: message };
  }
}

export async function getAuthorizedEmailsAction() {
  await requireAdmin();
  return await db.authorizedEmail.findMany({
    orderBy: { addedAt: 'desc' },
  });
}
