import React from 'react';
import { redirect } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { requireAdmin } from '@/lib/authGuard';
import { db } from '@/lib/db';
import { AdminLogsClient } from './AdminLogsClient';

export default async function AdminLogsPage() {
  let adminEmail = '';
  try {
    const session = await requireAdmin();
    adminEmail = session.user.email || '';
  } catch (_err) {
    redirect('/');
  }

  // Fetch initial batch of system logs (NO userId filter - returns all system logs)
  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Fetch list of users for dropdown filter
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: { email: 'asc' },
  });

  const serializableLogs = logs.map((log) => ({
    ...log,
    status: log.status || ('SUCCESS' as const),
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <AuthGuard>
      <AdminLogsClient logs={serializableLogs} users={users} currentAdminEmail={adminEmail} />
    </AuthGuard>
  );
}
